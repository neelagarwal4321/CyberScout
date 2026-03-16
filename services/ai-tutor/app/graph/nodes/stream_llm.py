from langchain_groq import ChatGroq
from app.graph.state import AgentState
from app.config import settings

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, streaming=True)
    return _llm

async def stream_llm(state: AgentState) -> AgentState:
    response = await get_llm().ainvoke(state["full_prompt"], max_tokens=state["max_tokens"])
    text = response.content
    tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    return {**state, "response_text": text, "tokens_used": tokens}
