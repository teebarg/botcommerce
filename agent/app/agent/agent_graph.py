"""
LangGraph customer support agent.
"""
import logging
import re
import uuid
from datetime import datetime
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
    session_id: str | None
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
    "When search_products returns results, do NOT list the products in your reply — "
    "they are displayed as visual cards in the UI automatically. "
    "Instead, just tell the customer how many options you found and invite them to ask for details. "
    "Example: 'I found 3 options for you! Let me know if you'd like more details on any of them.' "
    "(2) For order questions: call check_order_status with the order ID. "
    "(3) For stock questions: call check_stock only when the customer explicitly asks if something is in stock. "
    "(4) For policy or how-to questions: call search_faqs or search_policies. "
    "(5) For refunds: confirm order ID and reason before calling request_refund. "
    "(6) The system may collect details before escalating to a human. Only call escalate_to_human when the system instructs you to do so."
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


# ── Slack escalation notifier ─────────────────────────────────────────────────

async def _notify_slack_escalation(
    session_id: str | None,
    customer_id: str | None,
    reason: str,
) -> None:
    """
    Post an escalation alert to Slack via incoming webhook.
    Fails silently — a notification failure should never break the agent response.
    """
    import httpx
    from datetime import timezone
    from app.config import settings

    webhook_url: str | None = settings.SLACK_WEBHOOK_URL
    if not webhook_url:
        logger.warning("[Escalation] SLACK_WEBHOOK_URL not set — skipping Slack notification")
        return

    # Strip internal prefixes from the reason string
    reason_clean = reason.replace("ESCALATED_TO_HUMAN: ", "").replace("ESCALATED: ", "").strip()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🚨 Escalation: Customer Needs Human Support"},
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": "*Session ID:*\n`" + (session_id or "unknown") + "`"},
                    {"type": "mrkdwn", "text": "*Customer ID:*\n`" + (customer_id or "guest") + "`"},
                    {"type": "mrkdwn", "text": "*Time:*\n" + timestamp},
                    {"type": "mrkdwn", "text": "*Reason:*\n" + reason_clean},
                ],
            },
            {"type": "divider"},
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": "Reply to this thread once the customer has been contacted."}
                ],
            },
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(webhook_url, json=payload)
            if resp.status_code == 200:
                logger.info(f"[Escalation] Slack notified for session {session_id}")
            else:
                logger.warning(f"[Escalation] Slack returned {resp.status_code}: {resp.text}")
    except Exception as exc:
        logger.error(f"[Escalation] Slack notification failed: {exc}")


# ── Form definitions ──────────────────────────────────────────────────────────

FORMS: dict[str, dict] = {
    "escalation_details": {
        "type": "escalation_details",
        "title": "Before we connect you with an agent",
        "subtitle": "This helps the support team assist you faster.",
        "fields": [
            {"name": "name",    "label": "Your name",          "type": "text",     "required": True,  "placeholder": "e.g. John Doe"},
            {"name": "phone",   "label": "Phone number",       "type": "tel",      "required": False, "placeholder": "e.g. +234 801 234 5678"},
            {"name": "summary", "label": "Describe the issue", "type": "textarea", "required": True,  "placeholder": "What is going wrong?"},
        ],
    },
    "complaint": {
        "type": "complaint",
        "title": "Submit a Complaint or Feedback",
        "subtitle": "We will review this and get back to you.",
        "fields": [
            {"name": "subject",  "label": "Subject",      "type": "text",     "required": True, "placeholder": "Brief subject line"},
            {"name": "category", "label": "Category",     "type": "select",   "required": True,
             "options": ["Wrong item received", "Damaged product", "Late delivery", "Poor service", "Billing issue", "Other"]},
            {"name": "details",  "label": "Full details", "type": "textarea", "required": True, "placeholder": "Please describe your experience..."},
        ],
    },
    "contact_update": {
        "type": "contact_update",
        "title": "Update Contact Information",
        "subtitle": "We will update your details on file.",
        "fields": [
            {"name": "full_name", "label": "Full name",        "type": "text",     "required": False, "placeholder": "Leave blank to keep current"},
            {"name": "email",     "label": "Email address",    "type": "email",    "required": False, "placeholder": "Leave blank to keep current"},
            {"name": "phone",     "label": "Phone number",     "type": "tel",      "required": False, "placeholder": "Leave blank to keep current"},
            {"name": "address",   "label": "Delivery address", "type": "textarea", "required": False, "placeholder": "Leave blank to keep current"},
        ],
    },
}

_FORM_TRIGGER_RULES = re.compile(
    r"(?P<escalation>escalat|speak to (a )?human|talk to (a )?human|human agent|call me)"
    r"|(?P<complaint>complain|feedback|bad experience|wrong item|damaged|overcharged|poor service|unsatisfied)"
    r"|(?P<contact_update>update.{0,15}(contact|address|email|phone|number)|change.{0,15}(address|email|phone|number|details))",
    re.IGNORECASE,
)

_FORM_DETECTION_PROMPT = (
    "You are deciding whether a customer message needs a data-collection form. "
    "Available forms: "
    "escalation_details (customer wants human agent), "
    "complaint (complaint or negative feedback), "
    "contact_update (wants to update address/email/phone), "
    "null (no form needed). "
    "Customer message: {message} "
    "Agent reply: {reply} "
    "Reply with ONLY one of: escalation_details, complaint, contact_update, null."
)


async def _detect_form(message: str, reply: str, escalated: bool, llm) -> dict | None:
    """Rule-based + LLM form detection. Returns a FORMS entry or None."""
    import json as _json

    if escalated:
        return FORMS["escalation_details"]

    m = _FORM_TRIGGER_RULES.search(message)
    if m:
        if m.group("escalation"):
            return FORMS["escalation_details"]
        if m.group("complaint"):
            return FORMS["complaint"]
        if m.group("contact_update"):
            return FORMS["contact_update"]

    try:
        prompt = _FORM_DETECTION_PROMPT.format(message=message[:300], reply=reply[:300])
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        result = resp.content.strip().strip('"').lower()
        if result in FORMS:
            logger.info(f"[Form] LLM detected form: {result}")
            return FORMS[result]
    except Exception as exc:
        logger.debug(f"[Form] LLM detection failed: {exc}")

    return None


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
        # For search_products results, append a UI note so the model doesn't
        # re-list products in its text reply (they render as cards in the UI)
        messages = list(state["messages"])
        patched: list[BaseMessage] = []
        for msg in messages:
            if (
                isinstance(msg, ToolMessage)
                and msg.name == "search_products"
                and "<!-- UI_CARDS -->" not in str(msg.content)
                and "No matching products" not in str(msg.content)
            ):
                count = str(msg.content).count("(SKU:")
                note = (
                    f"\n\n<!-- UI_CARDS: {count} product card(s) will be shown in the UI automatically. "
                    "Do NOT list them in your text reply. Just acknowledge the count warmly and invite questions. -->"
                )
                msg = ToolMessage(
                    content=str(msg.content) + note,
                    tool_call_id=msg.tool_call_id,
                    name=msg.name,
                )
            patched.append(msg)

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
                await _notify_slack_escalation(
                    session_id=state.get("session_id"),
                    customer_id=state.get("customer_id"),
                    reason=str(msg.content),
                )

        return {"messages": patched, "sources": sources, "escalated": escalated}

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

# ── Reply cleaner ─────────────────────────────────────────────────────────────

def _strip_product_listing(reply: str, has_products: bool) -> str:
    """
    When structured product cards are returned, strip any duplicate product
    listing the model included in the reply text.
    """
    if not has_products:
        return reply

    import re as _re

    # Remove lead-in phrases like "Here are some examples:"
    reply = _re.sub(
        r"(Here are some (examples|options|products)[^:\n]*:\s*\n)",
        "",
        reply,
        flags=_re.IGNORECASE,
    )

    # Remove numbered product blocks: "1. **Name** ..." up to next item or end
    reply = _re.sub(
        r"\n?\d+\.\s+\*\*[^*]+\*\*.*?(?=\n\d+\.\s+\*\*|\Z)",
        "",
        reply,
        flags=_re.DOTALL,
    )

    # Collapse excess blank lines
    reply = _re.sub(r"\n{3,}", "\n\n", reply)

    return reply.strip()

# ── Quick replies ─────────────────────────────────────────────────────────────

# Complexity signals — if any match, we use the LLM to generate smart replies
_COMPLEX_SIGNALS = re.compile(
    r"(order|refund|return|payment|track|ship|stock|availab|broken|wrong|missing|complaint|issue|problem|help|human|agent)",
    re.IGNORECASE,
)

def _rule_based_quick_replies(message: str, sources: list[str], escalated: bool) -> list[str]:
    """Fast, zero-cost quick replies based on message content and tool sources used."""
    msg = message.lower()

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

    prompt = (
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
    llm_replies = await _llm_quick_replies(user_message, agent_reply, llm)
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

    # Escalation intent detected → show form first (DO NOT escalate yet)
    if _FORM_TRIGGER_RULES.search(message):
        match = _FORM_TRIGGER_RULES.search(message)

        if match and match.group("escalation"):
            return {
                "reply": "Sure — I’ll connect you with a support agent. First, please provide a few details.",
                "session_id": session_id,
                "sources": [],
                "products": [],
                "escalated": False,   # 🚫 not escalated yet
                "quick_replies": [],
                "form": FORMS["escalation_details"],
            }

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
        quick_replies = await _get_quick_replies(message, reply, [], False, llm)
        return {"reply": reply, "session_id": session_id, "sources": [], "escalated": False, "quick_replies": quick_replies}

    # Escalation form submission → now call escalate tool directly
    if message.lower().startswith("[escalation details form]"):
        from app.agent.tools import escalate_to_human

        result = await escalate_to_human({
            "reason": message
        })

        await _notify_slack_escalation(
            session_id=session_id,
            customer_id=customer_id,
            reason=message,
        )

        return {
            "reply": "Thank you. A human support agent will contact you shortly.",
            "session_id": session_id,
            "sources": [],
            "products": [],
            "escalated": True,
            "quick_replies": [],
            "form": None,
        }

    initial_state: AgentState = {
        "messages": history + [HumanMessage(content=message)],
        "customer_id": customer_id,
        "session_id": session_id,
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
        # Only extract products if search_products was called in THIS turn.
        # Check for ToolMessages added after the last HumanMessage.
        last_human_idx = max(
            (i for i, m in enumerate(final_state["messages"]) if isinstance(m, HumanMessage)),
            default=0,
        )
        current_turn_msgs = final_state["messages"][last_human_idx:]
        called_search = any(
            isinstance(m, ToolMessage) and m.name == "search_products"
            for m in current_turn_msgs
        )
        products = _extract_products(final_state["messages"]) if called_search else []

        # Strip product listing from reply text when cards are returned
        reply = _strip_product_listing(reply, has_products=bool(products))

        save_messages_to_redis(session_id, final_state["messages"])

        sources = final_state.get("sources", [])
        escalated = final_state.get("escalated", False)

        llm = get_llm()
        quick_replies = await _get_quick_replies(message, reply, sources, escalated, llm)
        form = await _detect_form(message, reply, escalated, llm)
        if form:
            quick_replies = []

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": sources,
            "escalated": escalated,
            "products": products,
            "quick_replies": quick_replies,
            "form": form,
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
            "products": [],
            "escalated": False,
            "quick_replies": [],
            "form": None,
        }