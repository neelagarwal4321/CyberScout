from langgraph.graph import StateGraph, END, START
from app.graph.state import AgentState
from app.graph.nodes import quota_gate, embed_query, retrieve_chunks, construct_prompt, stream_llm, audit_log, cache_write

def build_rag_graph():
    graph = StateGraph(AgentState)

    graph.add_node("quota_gate", quota_gate)
    graph.add_node("embed_query", embed_query)
    graph.add_node("retrieve_chunks", retrieve_chunks)
    graph.add_node("construct_prompt", construct_prompt)
    graph.add_node("stream_llm", stream_llm)
    graph.add_node("audit_log", audit_log)
    graph.add_node("cache_write", cache_write)

    graph.add_edge(START, "quota_gate")

    graph.add_conditional_edges("quota_gate",
        lambda s: "denied" if not s["quota_allowed"] else ("cache_hit" if s["cache_hit"] else "embed"),
        {"denied": END, "cache_hit": "audit_log", "embed": "embed_query"})

    graph.add_edge("embed_query", "retrieve_chunks")
    graph.add_edge("retrieve_chunks", "construct_prompt")
    graph.add_edge("construct_prompt", "stream_llm")
    graph.add_edge("stream_llm", "audit_log")
    graph.add_edge("audit_log", "cache_write")
    graph.add_edge("cache_write", END)

    return graph.compile()
