from langchain_core.runnables import RunnableConfig
import logging
import uuid
import re

from app.config import get_llm, get_settings
from app.agent.memory import load_memory_from_redis, save_memory_to_redis
from app.agent.state import AgentState
from app.agent.graph import build_support_graph

logger = logging.getLogger(__name__)

# ── Conversational shortcut (EXACTLY the same as you had — we keep this!) ─────
CONVERSATIONAL_PATTERNS = re.compile(
    r"^\s*(hi+|hey+|hello+|howdy|good\s*(morning|afternoon|evening)|"
    r"who are you|what are you|are you (a |an )?(bot|ai|robot|human|person|agent)|"
    r"what('?s| is) your name|tell me about yourself|"
    r"thanks?|thank you|cheers|ok(ay)?|great|awesome|bye|goodbye|"
    r"help|what can you do|how can you help)\s*[?!.]*\s*$",
    re.IGNORECASE,
)

CONVERSATIONAL_SYSTEM = """You are a friendly human customer support agent named Alex, working for an online shop.

Keep responses short, warm, and natural — like a real person would reply in a chat.

Important:
- Never say you are an AI, bot, robot, or language model
- Never mention Claude, GPT, Groq, or any AI company
- If asked who you are: you're Alex, a support agent for the shop
- If asked what you can do: briefly mention orders, products, returns, policies
- Use the customer's name if provided, keep it casual and friendly
- One or two sentences is enough for simple messages"""


async def _handle_conversational(
    message: str,
    customer_name: str | None,
    llm,
) -> str:
    """Single LLM call for simple messages — bypasses the graph entirely."""
    context = f"The customer's name is {customer_name}." if customer_name else ""
    messages = [
        ("system", CONVERSATIONAL_SYSTEM + ("\n\n" + context if context else "")),
        ("human", message),
    ]
    response = await llm.ainvoke(messages)
    return response.content.strip()


# ── New router + LangGraph path ───────────────────────────────────────────────
async def run_agent(
    message: str,
    session_id: str | None = None,
    customer_id: str | None = None,
) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80]}")

    # ── Conversational shortcut (kept 100% unchanged) ───────────────────────
    if CONVERSATIONAL_PATTERNS.match(message.strip()):
        logger.info("[Agent] Conversational message — skipping graph")
        llm = get_llm()
        reply = await _handle_conversational(message, customer_id, llm)

        memory = load_memory_from_redis(session_id)
        memory.chat_memory.add_user_message(message)
        memory.chat_memory.add_ai_message(reply)
        save_memory_to_redis(session_id, memory)

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }

    # ── Router + LangGraph for everything else ──────────────────────────────
    state = AgentState(
        customer_id=customer_id,
        message=message,          # clean message
    )

    llm = get_llm()
    graph = build_support_graph()

    try:
        result = await graph.ainvoke(state)  # ← result is dict, not AgentState

        # Extract values from the dict returned by the last executed node
        reply = result.get("reply", "I'm sorry, I had trouble with that. Could you rephrase?")
        sources = result.get("sources", [])
        escalated = result.get("escalated", False)

        memory = load_memory_from_redis(session_id)
        memory.chat_memory.add_user_message(message)
        memory.chat_memory.add_ai_message(reply)
        save_memory_to_redis(session_id, memory)

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": sources,
            "escalated": escalated,
        }

    except Exception as e:
        logger.error(f"[Agent] Error for session {session_id}: {e}", exc_info=True)
        return {
            "reply": "Something went wrong on my end. Please try again or contact support directly.",
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }