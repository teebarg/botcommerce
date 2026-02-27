"""
LangGraph customer support agent.
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
    ToolMessage,
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


# ── State ─────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    customer_id: str | None
    escalated: bool
    sources: list[str]
    iterations: int


MAX_ITERATIONS = 6


# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are Alex, a friendly customer support agent for an online shop. "
    "Never reveal you are an AI or mention any AI company. "
    "Never make up product details, prices, or order information — always use tools. "
    "Tool usage rules: "
    "(1) For product questions: call search_products once with the customer query. "
    "(2) For order questions: call check_order_status with the order ID. "
    "(3) For stock questions: call check_stock only when the customer explicitly asks if something is in stock. "
    "(4) For policy or how-to questions: call search_faqs or search_policies. "
    "(5) For refunds: confirm order ID and reason before calling request_refund. "
    "(6) Only escalate_to_human when the customer explicitly asks for a human, is abusive, or the issue involves fraud or legal matters. "
    "Never escalate just because a product was not found — tell the customer politely instead. "
    "Keep replies concise and warm."
)

CONVERSATIONAL_PATTERNS = re.compile(
    r"^\s*(hi+|hey+|hello+|howdy|good\s*(morning|afternoon|evening)|"
    r"who are you|what are you|are you (a |an )?(bot|ai|robot|human|person|agent)|"
    r"what('?s| is) your name|tell me about yourself|"
    r"thanks?|thank you|cheers|ok(ay)?|great|awesome|bye|goodbye|"
    r"help|what can you do|how can you help)\s*[?!.]*\s*$",
    re.IGNORECASE,
)


# ── Prompt sanitizer ──────────────────────────────────────────────────────────

_REACT_RE = re.compile(
    r"^(Thought:|Action:|Action Input:|Observation:|Final Answer:)",
    re.MULTILINE,
)

def _sanitize_prompt(messages: list) -> list:
    """Strip old ReAct-style messages that cause XML tool call output."""
    clean = []
    for msg in messages:
        if isinstance(msg, (HumanMessage, AIMessage)):
            if _REACT_RE.search(str(msg.content)):
                continue
        clean.append(msg)
    return clean


# ── Verbose logger ────────────────────────────────────────────────────────────

def _log_thought(state: AgentState) -> None:
    """Log the model's decision AFTER it responds (AIMessage is now in state)."""
    last = state["messages"][-1]
    if isinstance(last, AIMessage):
        if last.tool_calls:
            logger.info(f"[Thought] (iter {state.get('iterations', '?')}) "
                        f"Calling {len(last.tool_calls)} tool(s):")
            for tc in last.tool_calls:
                logger.info(f"  → {tc['name']}  args={tc['args']}")
        else:
            logger.info(f"[Final Answer] {str(last.content)[:200]}")


def _log_observations(state: AgentState) -> None:
    """Log only the ToolMessages added in the current tool batch."""
    batch: list[ToolMessage] = []
    for msg in reversed(state["messages"]):
        if not isinstance(msg, ToolMessage):
            break
        batch.append(msg)
    for msg in reversed(batch):          # log in forward order
        preview = str(msg.content)[:300]
        if len(str(msg.content)) > 300:
            preview += "..."
        logger.info(f"[Observation] ({msg.name}) {preview}")


# ── Graph ─────────────────────────────────────────────────────────────────────

def build_graph():
    llm = get_llm()
    tools = get_all_tools()
    llm_with_tools = llm.bind_tools(tools)

    async def call_model(state: AgentState) -> dict:
        # Log the incoming human message on first iteration only
        if state.get("iterations", 0) == 0:
            first_human = next(
                (m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)), None
            )
            if first_human:
                logger.info(f"\n{'='*60}")
                logger.info(f"[User] {first_human.content}")
                logger.info(f"{'='*60}")

        system = SYSTEM_PROMPT
        if state.get("customer_id"):
            system += f" The customer ID is {state['customer_id']}."

        def _count_tokens(msgs: list[BaseMessage]) -> int:
            return sum(len(str(m.content)) for m in msgs) // 4

        trimmed = trim_messages(
            state["messages"],
            max_tokens=6000,
            strategy="last",
            token_counter=_count_tokens,
            include_system=False,
            allow_partial=False,
        )

        prompt = _sanitize_prompt([SystemMessage(content=system)] + trimmed)

        try:
            response = await llm_with_tools.ainvoke(prompt)

        except Exception as exc:
            err = str(exc)
            logger.error(f"[Agent] LLM error: {err}")

            if "tool_use_failed" in err or "Failed to call a function" in err:
                last_human = next(
                    (m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)),
                    None,
                )
                minimal_prompt = [SystemMessage(content=system)]
                if last_human:
                    minimal_prompt.append(last_human)
                logger.warning("[Agent] Retrying with minimal prompt")
                try:
                    response = await llm_with_tools.ainvoke(minimal_prompt)
                except Exception as exc2:
                    logger.error(f"[Agent] Minimal retry failed: {exc2}")
                    response = await llm.ainvoke(minimal_prompt)
            else:
                raise

        new_iterations = state.get("iterations", 0) + 1

        # Log the model's decision now that we have the response
        updated_state = {**state, "messages": state["messages"] + [response], "iterations": new_iterations}
        _log_thought(updated_state)

        return {
            "messages": [response],
            "escalated": state.get("escalated", False),
            "sources": list(state.get("sources", [])),
            "iterations": new_iterations,
        }

    tool_node = ToolNode(tools)

    async def process_tool_results(state: AgentState) -> dict:
        # Log current batch observations
        _log_observations(state)

        # Update sources and escalated — only scan the current batch
        sources = list(state.get("sources", []))
        escalated = state.get("escalated", False)
        for msg in reversed(state["messages"]):
            if not isinstance(msg, ToolMessage):
                break
            if msg.name in ("search_products", "search_faqs", "search_policies"):
                label = msg.name.replace("search_", "").replace("_", " ").title()
                if label not in sources:
                    sources.append(label)
            if msg.name == "escalate_to_human":
                escalated = True

        return {"sources": sources, "escalated": escalated}

    def should_continue(state: AgentState) -> Literal["tools", "end"]:
        if state.get("iterations", 0) >= MAX_ITERATIONS:
            logger.warning(f"[Agent] Hit MAX_ITERATIONS ({MAX_ITERATIONS}) — forcing end.")
            return "end"
        last = state["messages"][-1]
        if isinstance(last, AIMessage) and last.tool_calls:
            return "tools"
        return "end"

    graph = StateGraph(AgentState)
    graph.add_node("model", call_model)
    graph.add_node("tools", tool_node)
    graph.add_node("process_tool_results", process_tool_results)
    graph.add_edge(START, "model")
    graph.add_conditional_edges("model", should_continue, {"tools": "tools", "end": END})
    graph.add_edge("tools", "process_tool_results")
    graph.add_edge("process_tool_results", "model")

    return graph.compile()


_graph = build_graph()


# ── Public API ────────────────────────────────────────────────────────────────

# ── Product extractor ─────────────────────────────────────────────────────────

def _extract_products(messages: list) -> list[dict]:
    import re as _re, json as _json
    pattern = _re.compile(r"<!-- PRODUCTS_JSON:(.+?) -->", _re.DOTALL)

    for msg in reversed(messages):
        if not isinstance(msg, ToolMessage) or msg.name != "search_products":
            continue
        m = pattern.search(str(msg.content))
        if m:
            try:
                return _json.loads(m.group(1))
            except Exception:
                pass
    return []


# ── Quick replies ─────────────────────────────────────────────────────────────

# Complexity signals — if any match, we use the LLM to generate smart replies
_COMPLEX_SIGNALS = re.compile(
    r"(order|refund|return|payment|track|ship|stock|availab|broken|wrong|missing|complaint|issue|problem|help|human|agent)",
    re.IGNORECASE,
)

def _rule_based_quick_replies(message: str, sources: list[str], escalated: bool) -> list[str]:
    """Fast, zero-cost quick replies based on message content and tool sources used."""
    msg: str = message.lower()

    if escalated:
        return ["Check order status", "Browse products", "Return policy"]

    if "order" in msg or "track" in msg or "status" in msg:
        return ["Track another order", "Request refund", "Speak to human"]

    if "refund" in msg or "return" in msg or "exchange" in msg:
        return ["Start a return", "Track my order", "Speak to human"]

    if "stock" in msg or "available" in msg or "availab" in msg:
        return ["Browse products", "Notify when available", "See alternatives"]

    if "pay" in msg or "payment" in msg or "checkout" in msg:
        return ["Browse products", "Track my order", "Return policy"]

    if "Products" in sources:
        return ["Check stock", "How to order", "See more products", "Return policy"]

    if "Faqs" in sources or "Policies" in sources:
        return ["Track my order", "Browse products", "Speak to human"]

    # Default / greeting / unrecognised
    return ["Track my order", "Browse products", "Return policy", "Speak to human"]


async def _llm_quick_replies(
    user_message: str,
    agent_reply: str,
    llm,
) -> list[str]:
    """
    Ask the LLM to generate context-aware quick replies.
    Returns 2-4 short button labels. Falls back to [] on any error.
    """
    import json as _json

    prompt: str = (
        f"Customer said: \"{user_message}\"\n"
        f"Agent replied: \"{agent_reply[:300]}\"\n\n"
        "Suggest 2-4 quick reply button labels the customer might click next. "
        "Rules: max 5 words each, action-oriented, relevant to the conversation. "
        "Return ONLY a valid JSON array of strings, nothing else.\n"
        "Example: [\"Track my order\", \"Request refund\", \"Speak to human\"]"
    )
    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        match = re.search(r"\[.*?\]", resp.content, re.DOTALL)
        if match:
            parsed = _json.loads(match.group())
            # Sanitise: keep only short strings
            return [str(r).strip() for r in parsed if len(str(r)) <= 40][:4]
    except Exception as exc:
        logger.debug(f"[quick_replies] LLM fallback failed: {exc}")
    return []


async def _get_quick_replies(
    user_message: str,
    agent_reply: str,
    sources: list[str],
    escalated: bool,
    llm,
) -> list[str]:
    """
    Combined strategy:
    - Simple / greeting messages → rule-based (instant, no cost)
    - Complex messages (orders, refunds, complaints) → LLM-generated with rule-based fallback
    """
    is_complex = bool(_COMPLEX_SIGNALS.search(user_message))

    if not is_complex:
        return _rule_based_quick_replies(user_message, sources, escalated)

    # Try LLM first for complex cases
    llm_replies: list[str] = await _llm_quick_replies(user_message, agent_reply, llm)
    if llm_replies:
        return llm_replies

    # LLM failed — fall back to rules
    return _rule_based_quick_replies(user_message, sources, escalated)


async def run_agent(
    message: str,
    session_id: str | None = None,
    customer_id: str | None = None,
) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80]}")

    history: list[BaseMessage] = load_messages_from_redis(session_id)

    if CONVERSATIONAL_PATTERNS.match(message.strip()):
        logger.info("[Agent] Conversational shortcut")
        llm = get_llm()
        resp = await llm.ainvoke(
            [SystemMessage(content=SYSTEM_PROMPT), *history, HumanMessage(content=message)]
        )
        reply = resp.content.strip()
        save_messages_to_redis(
            session_id,
            history + [HumanMessage(content=message), AIMessage(content=reply)],
        )
        quick_replies: list[str] = await _get_quick_replies(message, reply, [], False, llm)
        return {"reply": reply, "session_id": session_id, "sources": [], "escalated": False, "quick_replies": quick_replies}

    initial_state: AgentState = {
        "messages": history + [HumanMessage(content=message)],
        "customer_id": customer_id,
        "escalated": False,
        "sources": [],
        "iterations": 0,
    }

    try:
        final_state = await _graph.ainvoke(
            initial_state,
            config=RunnableConfig(tags=[session_id]),
        )

        reply = ""
        for msg in reversed(final_state["messages"]):
            if isinstance(msg, AIMessage) and not msg.tool_calls:
                reply = msg.content.strip()
                break

        if not reply:
            reply = "I'm sorry, I had trouble with that. Could you give me more details?"

        # Extract structured products from search_products tool messages.
        # We scan all ToolMessages in this conversation for search_products calls
        # and parse their text output back into dicts for the UI to render as cards.
        products = _extract_products(final_state["messages"])

        save_messages_to_redis(session_id, final_state["messages"])

        sources = final_state.get("sources", [])
        escalated = final_state.get("escalated", False)
        quick_replies = await _get_quick_replies(message, reply, sources, escalated, get_llm())

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": sources,
            "escalated": escalated,
            "products": products,
            "quick_replies": quick_replies,
        }

    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower() or "ResourceExhausted" in err or "rate_limit" in err.lower():
            reply = "I'm currently experiencing high demand. Please try again in a few minutes."
            logger.warning(f"[Agent] Rate limit hit for session {session_id}")
        else:
            logger.error(f"[Agent] Error for session {session_id}: {e}", exc_info=True)
            reply = "Something went wrong on my end. Please try again or contact support directly."

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": [],
            "escalated": False,
            "quick_replies": [],
        }