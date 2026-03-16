import asyncpg
from datetime import datetime
from app.graph.state import AgentState
from app.utils.redis import get_redis
from app.config import settings

async def audit_log(state: AgentState) -> AgentState:
    redis = await get_redis()
    date_key = datetime.now().strftime("%Y-%m-%d")
    key = f"ai:quota:{state['user_id']}:{date_key}"
    await redis.incr(key)
    await redis.expire(key, 86400)

    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        await conn.execute(
            """INSERT INTO ai_query_history (user_id, query, response, course_id, lesson_id, tokens_used, quota_before, model_version)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8)""",
            state["user_id"], state["query"], state["response_text"],
            state.get("course_id"), state.get("lesson_id"),
            state["tokens_used"], state["quota_remaining"], settings.GROQ_MODEL
        )
        await conn.close()
    except Exception:
        pass

    await redis.xadd("stream:ai_query_logged",
                     {"user_id": state["user_id"], "tokens_used": str(state["tokens_used"])})

    return state
