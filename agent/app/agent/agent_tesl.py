"""
app/agent/agent.py
LangGraph-based customer support agent.
Replaces the previous LangChain ReAct AgentExecutor implementation.
Tools and FastAPI routes are unchanged.
"""
import logging
import re
import uuid
from typing import Annotated, Literal

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    trim_messages,
)
from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from app.agent.memory import load_messages_from_redis, save_messages_to_redis
from app.agent.tools import get_all_tools
from app.config import get_llm

logger = logging.getLogger(__name__)

# ── State definition ──────────────────────────────────────────────────────────
# `add_messages` is a reducer: new messages are appended, not replaced.

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    customer_id: str | None
    escalated: bool
    sources: list[str]


# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are Alex, a friendly customer support agent for an online shop.
Never reveal you are an AI, bot, or mention any AI company.

RULES:
- Use tools to look up real information — never invent order details, prices, or policies
- Before processing a refund, confirm the order number and reason with the customer
- If you cannot resolve an issue after 2 attempts, use escalate_to_human
- Keep responses concise and warm
- If a message is unrelated to the shop, politely redirect the customer
  to topics about products, orders, or support."""


# ── Conversational shortcut ───────────────────────────────────────────────────
# Simple greetings / acknowledgements bypass tool-calling entirely.

CONVERSATIONAL_PATTERNS = re.compile(
    r"^\s*(hi+|hey+|hello+|howdy|good\s*(morning|afternoon|evening)|"
    r"who are you|what are you|are you (a |an )?(bot|ai|robot|human|person|agent)|"
    r"what('?s| is) your name|tell me about yourself|"
    r"thanks?|thank you|cheers|ok(ay)?|great|awesome|bye|goodbye|"
    r"help|what can you do|how can you help)\s*[?!.]*\s*$",
    re.IGNORECASE,
)


# ── Graph nodes ───────────────────────────────────────────────────────────────

def build_graph():
    """Build and compile the LangGraph state machine. Called once at startup."""

    llm = get_llm()
    tools = get_all_tools()

    # Bind tools to the LLM so it can emit tool-call messages
    llm_with_tools = llm.bind_tools(tools)

    # ── Node: call the LLM ────────────────────────────────────────────────────
    def call_model(state: AgentState) -> dict:
        """
        Core LLM node. Prepends the system prompt on every call so the
        model always has its persona, regardless of history length.
        """
        system = SYSTEM_PROMPT
        if state.get("customer_id"):
            system += f"\n\nThe customer's ID is {state['customer_id']}."

        # Trim history to avoid blowing the context window.
        # We use a simple character-based counter (~4 chars per token) because
        # Groq models don't ship a tokenizer and the llm counter would require
        # `pip install transformers` as a fallback.
        def _count_tokens(msgs: list[BaseMessage]) -> int:
            return sum(len(m.content) for m in msgs) // 4

        trimmed = trim_messages(
            state["messages"],
            max_tokens=8000,
            strategy="last",
            token_counter=_count_tokens,
            include_system=False,       # we prepend our own system message
            allow_partial=False,
        )

        response = llm_with_tools.invoke(
            [SystemMessage(content=system)] + trimmed
        )

        # Detect escalation from tool calls in the response
        escalated = state.get("escalated", False)
        sources = list(state.get("sources", []))

        return {
            "messages": [response],
            "escalated": escalated,
            "sources": sources,
        }

    # ── Node: execute tools ───────────────────────────────────────────────────
    # ToolNode handles invoking the tool and appending ToolMessages automatically.
    tool_node = ToolNode(tools)

    # After tool execution we need to update escalation/sources metadata.
    def process_tool_results(state: AgentState) -> dict:
        """
        Inspects the most recent tool messages to update `sources` and `escalated`.
        Runs after ToolNode, before routing back to the LLM.
        """
        sources = list(state.get("sources", []))
        escalated = state.get("escalated", False)

        for msg in reversed(state["messages"]):
            # ToolMessages are appended by ToolNode
            if hasattr(msg, "name"):  # ToolMessage has a .name attribute
                if msg.name in ("search_products", "search_faqs", "search_policies"):
                    label = msg.name.replace("search_", "").replace("_", " ").title()
                    if label not in sources:
                        sources.append(label)
                if msg.name == "escalate_to_human":
                    escalated = True
            break  # only inspect the latest batch

        return {"sources": sources, "escalated": escalated}

    # ── Routing logic ─────────────────────────────────────────────────────────

    def should_continue(state: AgentState) -> Literal["tools", "end"]:
        """
        If the last AI message contains tool calls → run tools.
        Otherwise → we're done.
        """
        last = state["messages"][-1]
        if isinstance(last, AIMessage) and last.tool_calls:
            return "tools"
        return "end"

    # ── Wire the graph ────────────────────────────────────────────────────────

    graph = StateGraph(AgentState)

    graph.add_node("model", call_model)
    graph.add_node("tools", tool_node)
    graph.add_node("process_tool_results", process_tool_results)

    graph.add_edge(START, "model")
    graph.add_conditional_edges(
        "model",
        should_continue,
        {"tools": "tools", "end": END},
    )
    graph.add_edge("tools", "process_tool_results")
    graph.add_edge("process_tool_results", "model")  # loop back after tools

    return graph.compile()


# Compile once at import time
_graph = build_graph()


# ── Public entry point ────────────────────────────────────────────────────────

async def run_agent(
    message: str,
    session_id: str | None = None,
    customer_id: str | None = None,
) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(
        f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80]}"
    )

    # Load persisted message history from Redis
    history: list[BaseMessage] = load_messages_from_redis(session_id)

    # ── Conversational shortcut ────────────────────────────────────────────
    # Simple messages get a direct LLM call — no tool loop needed.
    if CONVERSATIONAL_PATTERNS.match(message.strip()):
        logger.info("[Agent] Conversational message — single LLM call")
        llm = get_llm()
        system = SYSTEM_PROMPT
        if customer_id:
            system += f"\n\nThe customer's name/ID is {customer_id}."

        response = await llm.ainvoke(
            [SystemMessage(content=system), *history, HumanMessage(content=message)]
        )
        reply = response.content.strip()

        updated_history = history + [HumanMessage(content=message), AIMessage(content=reply)]
        save_messages_to_redis(session_id, updated_history)

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }

    # ── Full ReAct loop via LangGraph ──────────────────────────────────────
    initial_state: AgentState = {
        "messages": history + [HumanMessage(content=message)],
        "customer_id": customer_id,
        "escalated": False,
        "sources": [],
    }

    try:
        final_state = await _graph.ainvoke(
            initial_state,
            config=RunnableConfig(tags=[session_id]),
        )

        # Extract the last AI message as the reply
        reply = ""
        for msg in reversed(final_state["messages"]):
            if isinstance(msg, AIMessage) and not msg.tool_calls:
                reply = msg.content.strip()
                break

        if not reply:
            reply = "I'm sorry, I had trouble with that. Could you give me more details?"

        # Persist the full updated history
        save_messages_to_redis(session_id, final_state["messages"])

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": final_state.get("sources", []),
            "escalated": final_state.get("escalated", False),
        }

    except Exception as e:
        logger.error(f"[Agent] Error for session {session_id}: {e}", exc_info=True)
        return {
            "reply": "Something went wrong on my end. Please try again or contact support directly.",
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }