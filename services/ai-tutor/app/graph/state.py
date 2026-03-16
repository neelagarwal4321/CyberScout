from typing import TypedDict, Optional, List

class AgentState(TypedDict):
    user_id: str
    query: str
    user_tier: str
    course_id: Optional[str]
    lesson_id: Optional[str]
    enrolled_course_ids: List[str]
    quota_allowed: bool
    quota_remaining: int
    query_vector: Optional[List[float]]
    cache_hit: bool
    cached_response: Optional[str]
    retrieved_chunks: List[dict]
    full_prompt: Optional[object]
    max_tokens: int
    response_text: str
    tokens_used: int
    error: Optional[str]
