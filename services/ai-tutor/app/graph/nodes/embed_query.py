from sentence_transformers import SentenceTransformer
from app.graph.state import AgentState

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

async def embed_query(state: AgentState) -> AgentState:
    model = get_model()
    vector = model.encode(state["query"]).tolist()
    return {**state, "query_vector": vector}
