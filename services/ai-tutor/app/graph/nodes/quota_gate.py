import hashlib
from datetime import datetime
from app.graph.state import AgentState
from app.utils.redis import get_redis

TIER_LIMITS = {"free": 10, "beginner": 50, "intermediate": 100, "pro": 999999}

async def quota_gate(state: AgentState) -> AgentState:
    redis = await get_redis()
    limit = TIER_LIMITS.get(state["user_tier"], 10)
    date_key = datetime.now().strftime("%Y-%m-%d")
    redis_key = f"ai:quota:{state['user_id']}:{date_key}"
    current = int(await redis.get(redis_key) or 0)

    if current >= limit:
        return {**state, "quota_allowed": False, "quota_remaining": 0,
                "error": "QUOTA_EXCEEDED", "response_text": "Daily AI limit reached. Upgrade for more."}

    cache_key = hashlib.sha256(f"{state['query']}:{state['user_tier']}".encode()).hexdigest()
    cached = await redis.get(f"resp_cache:{cache_key}")
    if cached:
        return {**state, "quota_allowed": True, "cache_hit": True,
                "cached_response": cached.decode() if isinstance(cached, bytes) else cached,
                "response_text": cached.decode() if isinstance(cached, bytes) else cached,
                "quota_remaining": limit - current - 1}

    return {**state, "quota_allowed": True, "cache_hit": False, "quota_remaining": limit - current - 1}
