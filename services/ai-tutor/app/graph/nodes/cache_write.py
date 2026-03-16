import hashlib
from app.graph.state import AgentState
from app.utils.redis import get_redis

async def cache_write(state: AgentState) -> AgentState:
    redis = await get_redis()
    cache_key = hashlib.sha256(f"{state['query']}:{state['user_tier']}".encode()).hexdigest()
    await redis.set(f"resp_cache:{cache_key}", state["response_text"], ex=3600)
    return state
