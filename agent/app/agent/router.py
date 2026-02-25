from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Literal, Dict, Any

from app.config import get_llm   # just for type hint, not used here

# Exact tool names as intents (must match your get_all_tools() names)
RouteIntent = Literal[
    "search_products",
    "search_faqs",
    "search_policies",
    "check_order_status",
    "check_stock",
    "request_refund",
    "report_fraud",
    "guide_checkout",
    "guide_payment_methods",
    "guide_return_process",
    "guide_discounts",
    "guide_account",
    "escalate_to_human",
    "fallback_response",
]


class Route(BaseModel):
    intent: RouteIntent
    params: Dict[str, Any] = Field(default_factory=dict)


router_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert intent classifier for an online eshop customer support.

Available intents (use EXACTLY these names, lowercase with underscores):
- search_products          → customer wants products / catalog search. Extract "query"
- search_faqs              → searching FAQs. Extract "query"
- search_policies          → store policies, shipping, returns. Extract "query"
- check_order_status       → status of an order. Extract "order_id"
- check_stock              → stock / availability. Extract "product" or "sku"
- request_refund           → wants refund. Extract "order_id" and "reason" if mentioned
- report_fraud             → suspicious activity / fraud report
- guide_checkout           → help with checkout process
- guide_payment_methods    → payment options
- guide_return_process     → how to return items
- guide_discounts          → discounts, promo codes
- guide_account            → account, login, profile
- escalate_to_human        → angry, complex issue, or after 2 failed attempts
- fallback_response        → greetings, thanks, "who are you", unclear, off-topic

Rules:
- Always extract every parameter you can find.
- If it's a refund request but no order_id is mentioned → still pick "request_refund" (the node will ask for it).
- Only output valid JSON. No explanations.

Customer ID (if known): {customer_id}"""),
    ("user", "{message}")
])


async def route_message(state: "AgentState", llm) -> "AgentState":
    """Single structured LLM call to decide intent + extract params."""
    structured_llm = llm.with_structured_output(Route)

    messages = router_prompt.format_messages(
        customer_id=state.customer_id or "unknown",
        message=state.message,
    )

    route: Route = await structured_llm.ainvoke(messages)

    state.intent = route.intent
    state.params = route.params or {}
    return state