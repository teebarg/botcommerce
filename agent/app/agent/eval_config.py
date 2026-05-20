import re
from app.observability.eval_runner import AgentEvalConfig

SUPPORT_EVAL_CONFIG = AgentEvalConfig(
    agent_name="customer_support",
    agent_version="1.0.0",
    retrieval_tools=["search_products", "search_faqs", "search_policies"],
    tool_expectations=[
        (re.compile(r"do you have|looking for|show me|find me|got any", re.I), "search_products"),
        (re.compile(r"order|track|status|delivery", re.I),                     "check_order_status"),
        (re.compile(r"refund|return|exchange", re.I),                          "request_refund"),
        (re.compile(r"in stock|available|stock", re.I),                        "check_stock"),
        (re.compile(r"policy|return policy|shipping policy", re.I),            "search_policies"),
        (re.compile(r"how do I|faq|help with", re.I),                          "search_faqs"),
    ],
    routine_patterns=(
        r"not found|no results|unavailable|don't have|what products|do you sell"
        r"|do you have|looking for|show me|find me|any.*clothes|any.*tops"
    ),
    high_risk_patterns=(
        r"fraud|lawsuit|legal action|chargeback|threatening|report you|solicitor"
    ),
)


MARKETING_EVAL_CONFIG = AgentEvalConfig(
    agent_name="marketing",
    agent_version="1.0.0",
    retrieval_tools=["search_campaigns", "search_products"],
    tool_expectations=[
        (re.compile(r"discount|promo|offer|sale|coupon", re.I), "search_campaigns"),
        (re.compile(r"product|item|collection",          re.I), "search_products"),
    ],
    routine_patterns=r"discount|promo|offer|sale|new arrivals|collection",
    high_risk_patterns=r"lawsuit|fraud|false advertising|regulatory",
)