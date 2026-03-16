from langchain_core.prompts import ChatPromptTemplate
from app.graph.state import AgentState

TIER_MAX_TOKENS = {"free": 150, "beginner": 400, "intermediate": 1000, "pro": 2000}

SYSTEM_TEMPLATE = """You are a cybersecurity tutor on the CyberScout platform.
Answer ONLY using the context below. If the question is outside the provided context,
say "I can only help with topics covered in your enrolled courses."

User subscription tier: {tier}
If the question requires knowledge beyond their tier, give a brief 1-2 sentence answer
and suggest upgrading for the full explanation.

CONTEXT:
{context}

RULES:
- Be concise and educational
- Use code examples when relevant
- Never provide working exploit code for real systems
- Suggest related topics the student should explore next"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_TEMPLATE),
    ("human", "{query}"),
])

async def construct_prompt(state: AgentState) -> AgentState:
    context = "\n\n".join([f"[Source {i+1}]\n{c['text']}" for i, c in enumerate(state["retrieved_chunks"])])
    max_tokens = TIER_MAX_TOKENS.get(state["user_tier"], 150)
    formatted = prompt.format_messages(
        tier=state["user_tier"],
        context=context or "No relevant context found.",
        query=state["query"]
    )
    return {**state, "full_prompt": formatted, "max_tokens": max_tokens}
