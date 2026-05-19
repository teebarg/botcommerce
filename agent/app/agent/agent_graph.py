"""
LangGraph customer support agent.
"""
import time as _time
from app.logging import get_logger
from app.observability.tracing import record_llm_generation
import json
import re
import uuid
from typing import Annotated, Literal
from enum import Enum

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
from app.utils import _notify_slack_escalation
from app.agent.tools import escalate_to_human
from app.observability.tracing import record_tool_span

logger = get_logger(__name__)


# State
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    customer_id: int | None = None
    session_id: str | None = None
    escalated: bool = False
    complaint_sent: bool = False
    sources: list[str] = []
    iterations: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    query_intent: str = "ambiguous"


MAX_ITERATIONS = 6

SYSTEM_PROMPT = """You are Seun, a warm and helpful customer support agent for Thriftbyoba, a Nigerian online fashion store selling clothing and accessories for all ages.

## Identity
- Never reveal you are an AI or mention any AI company.
- If asked where the customer is, confirm they are at Thriftbyoba.
- Always use Nigerian Naira (₦) for prices. Never use dollars ($).
- Keep replies concise, friendly, and professional.

## Product Search
- ALWAYS call search_products before answering any product question. Never assume what we carry.
- NEVER call search_products with an empty query. If the question is too vague, ask the customer to be more specific.
- When results are returned, DO NOT list products in your reply — they display as cards in the UI automatically.
  Acknowledge the results naturally and conversationally. Vary your phrasing every time.
  Never repeat the same sentence twice across a conversation.
  You can comment on the selection, ask what they're looking for, or invite them to browse — keep it warm and human.
- If the results clearly do not match what the customer asked for (e.g. they asked for baby diapers but results show clothing), you MUST:
  1. Tell the customer we don't carry that specific item.
  2. Call search_products again with a related clothing/fashion query.
  3. Introduce the alternatives warmly in ONE sentence only.
- If the customer asks for something completely unrelated to fashion (e.g. electronics, food, furniture), do NOT search. Simply say we are a fashion store and ask if you can help with clothing instead.

## Orders, Stock & Policies
- Order status: call check_order_status with the order ID.
- Stock availability: call check_stock only when the customer explicitly asks.
- Policy or how-to questions: call search_faqs or search_policies.
- Refunds: confirm the order ID and reason before calling request_refund.

## Order Tracking
- NEVER assume or guess an order number.
- If the customer says "track my order" or "where is my order" without providing an order number,
  ask: "Could you please share your order number? It usually starts with ORD."
- Only call check_order_status once you have the order number from the customer.
- Never call check_order_status more than once for the same order number in a single turn.
- When presenting order results, ALWAYS include these fields in your reply:
  1. The order number (so the customer knows you found the right one)
  2. Current status in plain English
  3. Order value formatted as ₦X,XXX
  4. Payment method and status
  5. Date placed, formatted as "April 28, 2026"
  6. A helpful next step or reassurance based on the status
- Use natural language, never dump raw field values
- Format the date as human-readable e.g. "April 28, 2026" not "2026-04-28T13:48:32.415000Z"
- Format the price with ₦ and commas e.g. "₦5,375" not "5375.0"
- Use friendly status explanations:
  - PENDING → "Your order is being processed"
  - SHIPPED → "Your order is on its way"
  - DELIVERED → "Your order has been delivered"
  - CANCELLED → "Your order was cancelled"
- For CASH_ON_DELIVERY, reassure: "Payment will be collected when your order arrives"
- Always end with an offer to help further

## Escalation
Only respond with `ESCALATION_REQUIRED: <reason>` for: fraud, legal threats, lawsuits, chargebacks, abuse, or complex billing disputes.
Do NOT escalate for: missing products, unavailable items, or anything a search can resolve.
If the customer asks to contact support or speak to a human, respond ONLY with: `ESCALATION_REQUIRED: customer wants to contact support.`
Do not call any tool when escalating.

## Off-topic
If the customer asks about anything unrelated to Thriftbyoba, products, orders, or support (e.g. personal advice, general knowledge, jokes), politely decline and redirect. Do not call any tool.
"""


class MessageIntent(str, Enum):
    ESCALATION_REQUEST = "escalation_request"
    COMPLAINT = "complaint"
    CONVERSATION = "conversation"
    CONTACT_UPDATE = "contact_update"
    OUT_OF_SCOPE = "out_of_scope"
    FASHION = "fashion"
    NORMAL = "normal"

_UNIFIED_ROUTER_PROMPT = """Classify this customer message into exactly one category:

- escalation_request: wants to speak to a human agent
- complaint: complaining or had a bad experience
- conversation: general conversation(hi, hello)
- contact_update: wants to update contact details
- out_of_scope: asking about non-fashion items (electronics, food, furniture)
- fashion: clear fashion/clothing product query
- normal: everything else (greetings, order tracking, policy questions)

Message: {message}

Reply with ONLY the category label, nothing else."""

_CONVERSATIONAL_PATTERNS = re.compile(
    r"^\s*(hi+|hey+|hello+|howdy|good\s*(morning|afternoon|evening)|"
    r"who are you|what are you|are you (a |an )?(bot|ai|robot|human|person|agent)|"
    r"what('?s| is) your name|tell me about yourself|"
    r"thanks?|thank you|cheers|ok(ay)?|great|awesome|bye|goodbye|"
    r"help|what can you do|how can you help|"
    r"(good[,.]?\s+)?(what (do you sell|can you help|do you (have|carry|offer)))|"
    r"what('?s| is) (in stock|available|on (sale|offer)))\s*[?!.]*\s*$",
    re.IGNORECASE,
)
_ESCALATION_RE = re.compile(
    r"(speak (to|with) (a )?human|talk (to|with) (a )?human|human agent|call me"
    r"|need (a |to speak with )?(human|agent)|connect me"
    r"|(speak|talk|chat|connect).{0,20}(human|agent|person|someone|representative)"
    r"|(need|want).{0,20}(human|agent|real person)"
    r"|contact support|contact (an? )?(agent|team|us)|reach (out|support)|get (help|support))",
    re.IGNORECASE,
)
_COMPLAINT_RE = re.compile(
    r"(complain|bad experience|wrong item|damaged|overcharged|poor service|unsatisfied)",
    re.IGNORECASE,
)
_CONTACT_UPDATE_RE = re.compile(
    r"(update.{0,15}(contact|address|email|phone)|change.{0,15}(address|email|phone|details))",
    re.IGNORECASE,
)
_PRODUCT_QUERY_SIGNALS = re.compile(
    r"(do you (sell|have|carry)|looking for|find me|search|show me|any .+in stock|what .+(have|carry|sell))",
    re.IGNORECASE,
)

async def _classify_message(message: str) -> MessageIntent:
    """
    Regex handles obvious cases first to avoid the LLM call entirely.
    """
    msg = message.strip()

    if _ESCALATION_RE.search(msg):
        return MessageIntent.ESCALATION_REQUEST
    if _COMPLAINT_RE.search(msg):
        return MessageIntent.COMPLAINT
    if _CONTACT_UPDATE_RE.search(msg):
        return MessageIntent.CONTACT_UPDATE
    if _PRODUCT_QUERY_SIGNALS.search(msg):
        return MessageIntent.FASHION
    if _CONVERSATIONAL_PATTERNS.search(msg):
        return MessageIntent.CONVERSATION

    try:
        logger.debug(f"[Classify Message] Calling LLM to classify intent")
        llm = get_llm()
        resp = await llm.ainvoke([ HumanMessage(content=_UNIFIED_ROUTER_PROMPT.format(message=msg)) ])
        result = _extract_text_content(resp.content).strip().lower()
        if result in MessageIntent.__members__.values():
            return MessageIntent(result)
    except Exception as e:
        logger.error(f"[Router] Classification failed: {e}")

    return MessageIntent.NORMAL


def _extract_tools_called(messages: list) -> list[dict]:
    """Extract tool calls made this turn as [{name, args, result_preview}]."""
    tools = []
    for msg in messages:
        if isinstance(msg, ToolMessage):
            tools.append({
                "name": msg.name or "unknown",
                "result_preview": str(msg.content)[:200],
            })
    return tools

MAX_TURNS = 5

def _build_persistable_history(
    prev_history: list[BaseMessage],
    current_human_msg: str,
    final_reply: str,
    called_search: bool,
) -> list[BaseMessage]:
    """
    Product search turns are stateless — never persisted.
    All other turns (orders, policies, general chat) are kept up to MAX_TURNS.
    """
    if called_search:
        return prev_history

    updated = prev_history + [
        HumanMessage(content=current_human_msg),
        AIMessage(content=final_reply),
    ]

    max_messages = MAX_TURNS * 2
    if len(updated) > max_messages:
        updated = updated[-max_messages:]

    return updated

# Prompt sanitizer
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


# Verbose logger
def _log_thought(state: AgentState) -> None:
    """Log the model's decision AFTER it responds (AIMessage is now in state)."""
    last = state["messages"][-1]
    if isinstance(last, AIMessage):
        if last.tool_calls:
            logger.debug(f"[Thought] (iter {state.get('iterations', '?')}) "
                        f"Calling {len(last.tool_calls)} tool(s):")
            for tc in last.tool_calls:
                logger.debug(f"  → {tc['name']}  args={tc['args']}")
        else:
            logger.debug(f"[Final Answer] {str(last.content)[:200]}")


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
        logger.debug(f"[Observation] ({msg.name}) {preview}")


# Form definitions
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

# Tool Call Repair
_TOOL_JSON_RE = re.compile(
    r'\{\s*"name"\s*:\s*"(?P<name>[^"]+)"\s*,\s*"arguments"\s*:\s*(?P<args>\{.*\})\s*\}',
    re.DOTALL,
)

def _repair_tool_call(response: AIMessage) -> AIMessage:
    """
    Convert malformed JSON tool-call text into proper LangChain tool_calls.
    """
    if getattr(response, "tool_calls", None):
        return response

    content = str(response.content).strip()

    match = _TOOL_JSON_RE.search(content)
    if not match:
        return response

    try:
        tool_name = match.group("name")
        tool_args = json.loads(match.group("args"))

        logger.debug(
            f"[Repair] Converted malformed tool JSON into tool_call: {tool_name}"
        )

        return AIMessage(
            content="",
            tool_calls=[
                {
                    "id": str(uuid.uuid4()),
                    "name": tool_name,
                    "args": tool_args,
                    "type": "tool_call",
                }
            ],
        )

    except Exception as e:
        logger.error(f"[Repair] Failed to repair tool call: {e}")
        return response


def _sanitize_loaded_history(messages: list[BaseMessage]) -> list[BaseMessage]:
    """Drop any ToolMessages or AIMessage tool-calls that survived serialisation."""
    return [
        m for m in messages
        if not isinstance(m, ToolMessage)
        and not (isinstance(m, AIMessage) and m.tool_calls)
    ]


# Graph
def build_graph():
    llm = get_llm()
    tools = get_all_tools()
    llm_with_tools = llm.bind_tools(tools)

    async def call_model(state: AgentState) -> dict:
        if state.get("iterations", 0) == 0:
            first_human = next(
                (m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)), None
            )
            if first_human:
                logger.debug(f"[Human Message] {first_human.content}")

            intent_str = state.get("query_intent", "normal")
            try:
                intent = MessageIntent(intent_str)
            except ValueError:
                intent = MessageIntent.NORMAL
        else:
            intent = MessageIntent.NORMAL

        system = SYSTEM_PROMPT
        if state.get("customer_id"):
            system += f" The customer ID is {state['customer_id']}."

        if intent == MessageIntent.OUT_OF_SCOPE:
            system += (
                "\n\nROUTER DECISION: This query is out of scope for a fashion store. "
                "Do NOT call any tool. Tell the customer we only sell fashion items "
                "and ask what clothing you can help them find."
            )
        elif intent == MessageIntent.FASHION:
            system += (
                "\n\nROUTER DECISION: This is a valid fashion query. "
                "Call search_products and present results normally."
            )

        def _count_tokens(msgs: list[BaseMessage]) -> int:
            return sum(len(str(m.content)) for m in msgs) // 4

        trimmed = trim_messages(
            state["messages"],
            max_tokens=5000,
            strategy="last",
            token_counter=_count_tokens,
            include_system=False,
            allow_partial=False,
        )

        prompt = _sanitize_prompt([SystemMessage(content=system)] + trimmed)
        _prompt_tokens = 0
        _completion_tokens = 0

        try:
            _t0 = _time.monotonic()
            response = await llm_with_tools.ainvoke(prompt)
            response = _repair_tool_call(response)
            _llm_ms = (_time.monotonic() - _t0) * 1000

            usage = (
                getattr(response, "usage_metadata", None)      # LangChain standard
                or getattr(response, "response_metadata", {}).get("token_usage", {})  # Groq fallback
                or {}
            )
            _prompt_tokens     = usage.get("input_tokens") or usage.get("prompt_tokens") or 0
            _completion_tokens = usage.get("output_tokens") or usage.get("completion_tokens") or 0

            _usage = getattr(response, "usage_metadata", None) or {}
            record_llm_generation(
                model=getattr(llm_with_tools, "model_name", "unknown"),
                prompt_tokens=_usage.get("input_tokens", 0),
                completion_tokens=_usage.get("output_tokens", 0),
                latency_ms=_llm_ms,
                input_messages=[str(m.content)[:200] for m in prompt],
                output_text=str(response.content)[:500],
                iteration=state.get("iterations", 0),
            )

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
                try:
                    response = await llm_with_tools.ainvoke(minimal_prompt)
                    logger.debug("[Agent] Retry with tools succeeded")
                except Exception:
                    logger.warning("[Agent] Retrying without tools")
                    raise
            else:
                raise

        new_iterations = state.get("iterations", 0) + 1
        updated_state = {**state, "messages": state["messages"] + [response], "iterations": new_iterations}
        _log_thought(updated_state)

        return {
            "messages": [response],
            "escalated": state.get("escalated", False),
            "complaint_sent": state.get("complaint_sent", False),
            "sources": list[str](state.get("sources", [])),
            "iterations": new_iterations,
            "prompt_tokens":     state.get("prompt_tokens", 0)     + _prompt_tokens,
            "completion_tokens": state.get("completion_tokens", 0) + _completion_tokens,
        }

    tool_node = ToolNode(tools)

    async def process_tool_results(state: AgentState) -> dict:
        messages = list(state["messages"])
        patched: list[BaseMessage] = []
        
        # Find the last AIMessage with tool_calls — only patch ToolMessages from that batch
        last_ai_tool_call_ids: set[str] = set()
        for msg in reversed(messages):
            if isinstance(msg, AIMessage) and msg.tool_calls:
                last_ai_tool_call_ids = {tc["id"] for tc in msg.tool_calls}
                break

        for msg in messages:
            if (
                isinstance(msg, ToolMessage)
                and msg.name == "search_products"
                and msg.tool_call_id in last_ai_tool_call_ids  # only current batch
                and "<!-- UI_CARDS -->" not in str(msg.content)
                and "No matching products" not in str(msg.content)
            ):
                count: int = str(msg.content).count("(SKU:")
                note: str = (
                    f"\n\n<!-- UI_CARDS: {count} product card(s) will be shown in the UI automatically. "
                    "Do NOT list product names, SKUs, or prices in your text reply — the cards handle that. "
                    "Respond naturally and conversationally, varying your phrasing each time. "
                    "Examples of good replies (do not copy verbatim): "
                    "'Sure! Here are some options that might work 😊', "
                    "'I pulled up a few things that could be a great fit!', "
                    "'Found some nice ones — take a look!', "
                    "'Here you go! Let me know if any catch your eye or if you want something different.' "
                    "Match the customer's energy — casual if they're casual, warm if they seem uncertain. -->"
                )
                msg = ToolMessage(
                    content=str(msg.content) + note,
                    tool_call_id=msg.tool_call_id,
                    name=msg.name,
                )
            patched.append(msg)

        _log_observations(state)

        sources: list[str] = list(state.get("sources", []))
        escalated: bool = state.get("escalated", False)

        for msg in reversed(state["messages"]):
            if not isinstance(msg, ToolMessage):
                break
            if msg.tool_call_id not in last_ai_tool_call_ids:
                break  # stop at previous turn's messages
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

        for msg in state["messages"]:
            if isinstance(msg, ToolMessage) and msg.tool_call_id in last_ai_tool_call_ids:
                record_tool_span(
                    tool_name=msg.name or "unknown",
                    tool_args={},
                    tool_result=str(msg.content)[:300],
                    latency_ms=0,
                )

        # Return only the patched versions of the current batch's tool messages
        new_tool_msgs = [
            m for m in patched
            if isinstance(m, ToolMessage) and m.tool_call_id in last_ai_tool_call_ids
        ]

        return {
            "messages": new_tool_msgs,
            "sources": sources,
            "escalated": escalated,
        }

    def should_continue(state: AgentState) -> Literal["tools", "end"]:
        if state.get("iterations", 0) >= MAX_ITERATIONS:
            logger.warning(f"[Agent] Hit MAX_ITERATIONS ({MAX_ITERATIONS}) — forcing end.")
            return "end"

        last = state["messages"][-1]
        if not (isinstance(last, AIMessage) and last.tool_calls):
            return "end"

        # Prevent calling the same tool with identical args twice in one session
        last_tool_name = last.tool_calls[0]["name"]
        last_tool_args = last.tool_calls[0]["args"]

        previous_tool_calls = [
            m for m in state["messages"][:-1]
            if isinstance(m, ToolMessage) and m.name == last_tool_name
        ]
        for prev in previous_tool_calls:
            # If this exact tool+args combo was already called, stop
            parent_ai = next(
                (m for m in state["messages"]
                if isinstance(m, AIMessage)
                and any(tc["id"] == prev.tool_call_id for tc in getattr(m, "tool_calls", []))),
                None,
            )
            if parent_ai and any(
                tc["args"] == last_tool_args for tc in getattr(parent_ai, "tool_calls", [])
            ):
                logger.warning(
                    f"[Agent] Duplicate tool call detected: {last_tool_name}({last_tool_args}) — forcing end."
                )
                return "end"

        return "tools"

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

# Product extractor
def _extract_products(messages: list) -> list[dict]:
    pattern = re.compile(r"<!-- PRODUCTS_JSON:(.+?) -->", re.DOTALL)

    for msg in reversed(messages):
        if not isinstance(msg, ToolMessage) or msg.name != "search_products":
            continue
        m = pattern.search(str(msg.content))
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                pass
    return []

def _extract_orders(messages):
    for m in messages:
        if isinstance(m, ToolMessage) and "ORDERS_JSON:" in m.content:
            raw = m.content.split("ORDERS_JSON:")[1].split("-->")[0]
            return json.loads(raw.strip())
    return None

# Quick replies
_QUICK_REPLIES: dict[str, list[str]] = {
    "awaiting_input":       [],
    "product_search":       ["Check stock", "See other options", "How to order", "Contact support"],
    "order_status":         ["Track another order", "Request refund", "Contact support"],
    "refund":               ["Check refund status", "Track my order", "Contact support"],
    "policy":               ["Track my order", "Browse products", "Contact support"],
    "escalated":            [],
    "complaint_sent":       [],
    "greeting":             ["Track my order", "Browse products", "View policies"],
    "default":              ["Track my order", "Browse products", "Contact support"],
}

_AWAITING_INPUT_PATTERNS = re.compile(
    r"(could you (please )?(share|provide|give)|"
    r"please (share|provide|send|give)|"
    r"what (is|was) your order|"
    r"can you (share|provide|confirm)|"
    r"please (confirm|clarify)|"
    r"could you (tell|let) me)",
    re.IGNORECASE,
)

def _get_quick_replies(
    user_message: str,
    agent_reply: str,
    sources: list[str],
    escalated: bool,
    called_search: bool,
    called_order: bool,
    complaint_sent: bool,
) -> list[str]:
    if _AWAITING_INPUT_PATTERNS.search(agent_reply):
        return _QUICK_REPLIES["awaiting_input"]

    if escalated or complaint_sent:
        return _QUICK_REPLIES["escalated"]

    if called_search:
        return _QUICK_REPLIES["product_search"]

    if called_order:
        return _QUICK_REPLIES["order_status"]

    msg = user_message.lower()

    if any(w in msg for w in ("refund", "return", "exchange")):
        return _QUICK_REPLIES["refund"]

    if any(w in msg for w in ("policy", "policies", "faq", "how do i", "how to")):
        return _QUICK_REPLIES["policy"]

    if "Faqs" in sources or "Policies" in sources:
        return _QUICK_REPLIES["policy"]

    if any(w in msg for w in ("hi", "hello", "hey", "good morning", "good afternoon")):
        return _QUICK_REPLIES["greeting"]

    return _QUICK_REPLIES["default"]


def _extract_text_content(content) -> str:
    """
    Normalize LLM content into a plain string.
    Handles:
    - str
    - list of content blocks (Gemini style)
    """
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        texts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                texts.append(block.get("text", ""))
        return "\n".join(texts)

    return str(content)


async def run_agent(
    message: str,
    session_id: str | None = None,
    customer_id: int | None = None,
) -> dict:

    if not session_id:
        session_id = str(uuid.uuid4())

    logger.debug(
        f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80] if len(message) > 80 else message}"
    )

    history: list[BaseMessage] = load_messages_from_redis(session_id)
    history = _sanitize_loaded_history(history)

    intent: str = await _classify_message(message)
    logger.debug(f"[Router] intent={intent} for message='{message[:60]}'")

    if intent == MessageIntent.CONVERSATION:
        logger.debug("[Agent] Conversational shortcut")
        llm = get_llm()
        resp = await llm.ainvoke(
            [SystemMessage(content=SYSTEM_PROMPT), *history, HumanMessage(content=message)]
        )

        reply: str = _extract_text_content(resp.content).strip()
        save_messages_to_redis(
            session_id,
            history + [HumanMessage(content=message), AIMessage(content=reply)],
        )
        quick_replies: list[str] = _get_quick_replies(
            user_message=message,
            agent_reply=reply,
            sources=[],
            escalated=False,
            called_search=False,
            called_order=False,
            complaint_sent=False,
        )
        return {"reply": reply, "session_id": session_id, "quick_replies": quick_replies}

    if intent == MessageIntent.ESCALATION_REQUEST:
        return {
            "reply": "Sure — I’ll connect you with a support agent. First, please provide a few details.",
            "session_id": session_id,
            "form": FORMS["escalation_details"],
        }

    if intent == MessageIntent.COMPLAINT:
        return {
            "reply": "I'm sorry about your experience. Please provide more details so we can investigate.",
            "session_id": session_id,
            "form": FORMS["complaint"],
        }

    if intent == MessageIntent.CONTACT_UPDATE:
        return {
            "reply": "Sure — please provide the updated details below.",
            "session_id": session_id,
            "form": FORMS["contact_update"],
        }

    initial_state: AgentState = {
        "messages": history + [HumanMessage(content=message)],
        "customer_id": customer_id,
        "session_id": session_id,
        "escalated": False,
        "sources": [],
        "iterations": 0,
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "query_intent": intent.value,
    }

    try:
        final_state = await _graph.ainvoke(
            initial_state,
            config=RunnableConfig(tags=[session_id]),
        )

        reply = ""
        for msg in reversed(final_state["messages"]):
            if isinstance(msg, AIMessage) and not msg.tool_calls:
                reply: str = _extract_text_content(msg.content).strip()
                break

        if not reply:
            reply = "I'm sorry, I had trouble with that. Could you give me more details?"

        if reply.startswith("ESCALATION_REQUIRED:"):
            reason: str = reply.replace("ESCALATION_REQUIRED:", "").strip()

            NON_ESCALATION_KEYWORDS: list[str] = [
                "not found", "no results", "couldn't find", "don't carry",
                "unavailable", "out of stock", "no matching", "pin down",
            ]

            if any(kw in reason.lower() for kw in NON_ESCALATION_KEYWORDS):
                reply = "I couldn't find that item in our catalog. Could you describe it differently or check the name?"
            else:
                high_risk: bool = any(
                    word in reason.lower()
                    for word in ["fraud", "legal", "lawsuit", "chargeback", "threat"]
                )

                if high_risk:
                    await escalate_to_human({"reason": reason})
                    await _notify_slack_escalation(session_id=session_id, customer_id=customer_id, reason=reason)
                    return {
                        "reply": "A human specialist has been alerted and will assist you shortly.",
                        "session_id": session_id,
                        "escalated": True,
                    }

                return {
                    "reply": "Sure — I'll connect you with a support agent. First, please provide a few details.",
                    "session_id": session_id,
                    "form": FORMS["escalation_details"],
                }

        last_human_idx: int = max(
            (i for i, m in enumerate(final_state["messages"]) if isinstance(m, HumanMessage)),
            default=0,
        )

        current_turn_msgs = final_state["messages"][last_human_idx:]
        called_search: bool = any(
            isinstance(m, ToolMessage) and m.name == "search_products"
            for m in current_turn_msgs
        )
        tools_called: list[dict] = _extract_tools_called(current_turn_msgs)

        called_check_order_status: bool = any(
            isinstance(m, ToolMessage) and m.name == "check_order_status"
            for m in current_turn_msgs
        )

        products = _extract_products(final_state["messages"]) if called_search else []
        extracted_order = _extract_orders(final_state["messages"]) if called_check_order_status else None
        if extracted_order:
            formatted_reply = extracted_order.pop("_formatted_reply", None)
            if formatted_reply:
                logger.debug("[Order] Using pre-formatted reply from tool payload")
                reply = formatted_reply
            else:
                logger.warning("[Order] _formatted_reply missing from payload — using LLM reply")

        clean_history = _build_persistable_history(
            prev_history=history,
            current_human_msg=message,
            final_reply=reply,
            called_search=called_search,
        )
        save_messages_to_redis(session_id, clean_history)

        sources = final_state.get("sources", [])
        escalated = final_state.get("escalated", False)

        llm = get_llm()
        quick_replies = _get_quick_replies(
            user_message=message,
            agent_reply=reply,
            sources=sources,
            escalated=escalated,
            called_search=called_search,
            called_order=called_check_order_status,
            complaint_sent=final_state.get("complaint_sent", False),
        )

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": sources,
            "products": products,
            "escalated": escalated,
            "quick_replies": quick_replies,
            "form": None,
            "order": extracted_order,
            "_prompt_tokens": final_state.get("prompt_tokens", 0),
            "_completion_tokens": final_state.get("completion_tokens", 0),
            "_tools_called": tools_called,
        }

    except Exception as e:
        logger.error(f"[Agent] Error: {e}", exc_info=True)
        raise
