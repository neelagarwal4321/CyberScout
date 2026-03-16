from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchAny
from app.graph.state import AgentState
from app.config import settings

_client = None

def get_qdrant():
    global _client
    if _client is None:
        _client = QdrantClient(url=settings.QDRANT_URL)
    return _client

TIER_RANK = {
    "free": ["free"],
    "beginner": ["free", "beginner"],
    "intermediate": ["free", "beginner", "intermediate"],
    "pro": ["free", "beginner", "intermediate", "pro"],
}

async def retrieve_chunks(state: AgentState) -> AgentState:
    allowed_tiers = TIER_RANK.get(state["user_tier"], ["free"])

    must_conditions = [FieldCondition(key="tier_required", match=MatchAny(any=allowed_tiers))]

    if state.get("enrolled_course_ids"):
        must_conditions.append(
            FieldCondition(key="course_id", match=MatchAny(any=state["enrolled_course_ids"]))
        )
    if state.get("lesson_id"):
        must_conditions.append(
            FieldCondition(key="lesson_id", match=MatchAny(any=[state["lesson_id"]]))
        )

    filters = Filter(must=must_conditions)

    try:
        results = get_qdrant().search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=state["query_vector"],
            query_filter=filters,
            limit=5,
            with_payload=True,
        )
        chunks = [{"text": r.payload.get("chunk_text", ""), "course_id": r.payload.get("course_id"),
                   "lesson_id": r.payload.get("lesson_id"), "score": r.score} for r in results]
    except Exception:
        chunks = []

    return {**state, "retrieved_chunks": chunks}
