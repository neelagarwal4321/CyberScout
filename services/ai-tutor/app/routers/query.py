import asyncio
import json
import asyncpg
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from langchain_groq import ChatGroq
from app.graph.pipeline import build_rag_graph
from app.schemas.ai import QueryRequest, FeedbackRequest
from app.config import settings
from app.utils.redis import get_redis

router = APIRouter()
rag_graph = build_rag_graph()

@router.get("/health_inner")
async def health():
    return {"status": "ok"}

@router.post("/ai/query")
async def ai_query(request: Request, body: QueryRequest):
    user = request.state.user

    # Get enrolled course IDs
    enrolled_ids = []
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        rows = await conn.fetch("SELECT course_id FROM course_enrollments WHERE user_id = $1", user.id)
        enrolled_ids = [str(r["course_id"]) for r in rows]
        await conn.close()
    except Exception:
        pass

    initial_state = {
        "user_id": user.id, "query": body.query, "user_tier": user.tier,
        "course_id": body.course_id, "lesson_id": body.lesson_id,
        "enrolled_course_ids": enrolled_ids,
        "quota_allowed": False, "quota_remaining": 0, "cache_hit": False,
        "cached_response": None, "query_vector": None, "retrieved_chunks": [],
        "full_prompt": None, "max_tokens": 150, "response_text": "", "tokens_used": 0, "error": None,
    }

    result = await rag_graph.ainvoke(initial_state)

    async def error_stream(error_msg: str, quota_remaining: int):
        yield f"data: {json.dumps({'error': error_msg, 'quota_remaining': quota_remaining})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    async def cached_stream(response: str, quota_remaining: int):
        yield f"data: {json.dumps({'token': response})}\n\n"
        yield f"data: {json.dumps({'done': True, 'quota_remaining': quota_remaining, 'cached': True})}\n\n"

    if result.get("error"):
        return StreamingResponse(error_stream(result["error"], result.get("quota_remaining", 0)), media_type="text/event-stream")

    if result.get("cache_hit"):
        return StreamingResponse(cached_stream(result.get("cached_response", ""), result["quota_remaining"]), media_type="text/event-stream")

    llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, streaming=True)

    async def generate():
        full_text = ""
        async for chunk in llm.astream(result["full_prompt"], max_tokens=result["max_tokens"]):
            token = chunk.content
            if token:
                full_text += token
                yield f"data: {json.dumps({'token': token})}\n\n"

        yield f"data: {json.dumps({'done': True, 'quota_remaining': result['quota_remaining'], 'tokens_used': len(full_text.split())})}\n\n"

        async def post_stream():
            redis = await get_redis()
            import hashlib
            cache_key = hashlib.sha256(f"{body.query}:{user.tier}".encode()).hexdigest()
            await redis.set(f"resp_cache:{cache_key}", full_text, ex=3600)
            await redis.xadd("stream:ai_query_logged", {"user_id": user.id, "tokens_used": str(len(full_text.split()))})

        asyncio.create_task(post_stream())

    return StreamingResponse(generate(), media_type="text/event-stream")

@router.get("/ai/history")
async def ai_history(request: Request, page: int = 1, limit: int = 20):
    user = request.state.user
    offset = (page - 1) * limit
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        rows = await conn.fetch(
            "SELECT id, query, response, tokens_used, created_at FROM ai_query_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
            user.id, limit, offset
        )
        await conn.close()
        return {"data": [dict(r) for r in rows]}
    except Exception as e:
        return {"data": [], "error": str(e)}

@router.post("/ai/feedback")
async def ai_feedback(request: Request, body: FeedbackRequest):
    user = request.state.user
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        await conn.execute(
            "INSERT INTO ai_feedback (query_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)",
            body.query_id, user.id, body.rating, body.comment
        )
        await conn.close()
        return {"data": {"message": "Feedback recorded"}}
    except Exception as e:
        return {"error": str(e)}
