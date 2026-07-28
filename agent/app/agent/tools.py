import jwt
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from langchain_classic.tools import tool
from app.rag.qdrant_client import search_collection
from app.config import settings
from app.mcp_tools import get_mcp_tools
from app.logging import get_logger

logger = get_logger(__name__)


def _make_http_session() -> requests.Session:
    session = requests.Session()
    
    retry_strategy = Retry(
        total=3,                        # retry 3 times
        backoff_factor=0.5,             # wait 0.5s, 1s, 2s between retries
        status_forcelist=[429, 500, 502, 503, 504],  # retry on these status codes
        allowed_methods=["GET", "POST"],
    )
    
    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=10,
        pool_maxsize=20,
    )
    
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    return session

_http_session = _make_http_session()


def _shop_request(method: str, path: str, **kwargs) -> dict:
    """Internal helper for calling the shop API with a short-lived JWT."""
    token = jwt.encode(
        {"sub": "agent", "role": "ADMIN", "exp": int(time.time()) + 300},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url: str = f"{settings.API_BASE_URL}{path}"
    try:
        response = _http_session.request(
            method=method,
            url=url,
            headers=headers,
            timeout=(3.0, 10.0),  # (connect_timeout, read_timeout)
            **kwargs,
        )
        response.raise_for_status()
        return response.json()
    except requests.Timeout:
        logger.warning(f"[ShopAPI] Timeout: {method} {path}")
        return {"error": "Request timed out"}
    except requests.ConnectionError:
        logger.error(f"[ShopAPI] Connection error: {method} {path}")
        return {"error": "Service unavailable"}
    except requests.HTTPError as e:
        logger.error(f"[ShopAPI] HTTP {e.response.status_code}: {method} {path}")
        return {"error": f"HTTP {e.response.status_code}"}
    except Exception as e:
        logger.error(f"[ShopAPI] Unexpected error: {e}")
        return {"error": str(e)}

@tool
def search_faqs(query: str) -> str:
    """
    Search the FAQ knowledge base for answers to common questions.
    Use when the customer asks about:
    - How something works (payment, checkout, account)
    - General store questions not related to a specific order
    Input: the customer's question as-is.
    """
    results = search_collection("faqs", query, top_k=2, score_threshold=0.5)
    if not results:
        return "No FAQ entry found for that question."

    output = "Here's what I found in our FAQ:\n\n"
    for r in results:
        output += f"**Q: {r['question']}**\nA: {r['answer']}\n\n"
    return output


@tool
def search_policies(query: str) -> str:
    """
    Search store policies: returns, shipping, warranty.
    Use when the customer asks about:
    - How to return or exchange an item
    - Refund timelines and eligibility
    - Shipping times and costs
    - Warranty coverage
    Input: what policy information the customer needs.
    """
    results = search_collection("policies", query, top_k=2, score_threshold=0.45)
    if not results:
        return "No relevant policy information found."
    return "Here's our relevant policy:\n\n" + "\n\n---\n\n".join(r["text"] for r in results)


@tool
def check_stock(product_slug: str) -> str:
    """
    Check if a specific product is in stock.
    Use when the customer asks:
    - Is this product available?
    - Do you have [product] in stock?
    Input: the product slug (e.g. 'shoe-red-42').
    If you don't have the slug, call search_products first to find it.
    """
    product_slug: str = product_slug.strip().lower()
    result = _shop_request("GET", f"/api/product/{product_slug}")

    if "error" in result:
        return f"Could not check stock for slug '{product_slug}': {result['error']}"

    if result.get("active"):
        return f"✅ Slug '{product_slug}' is **in stock** (1 unit available)."

    return f"❌ Slug '{product_slug}' is currently **out of stock**."


@tool
def escalate_to_human(reason: str) -> str:
    """
    Escalate the conversation to a human agent.
    Use ONLY for high-risk cases:
    - Fraud or suspected fraudulent activity
    - Legal threats or lawsuits
    - Chargebacks or billing disputes that cannot be resolved
    - Account security issues
    - Abusive or threatening behaviour
    Do NOT use when the customer simply asks to speak to a human — that is handled separately.
    Input: a brief summary of why escalation is needed.
    """
    logger.warning(f"[ESCALATION] {reason}")
    return f"ESCALATED: {reason}"


# Consolidated guide tool
_GUIDE_CONTENT = {
    "checkout": (
        "To place an order:\n"
        "1. Browse products and add items to your cart.\n"
        "2. Go to checkout.\n"
        "3. Enter your shipping and billing information.\n"
        "4. Choose a payment method and confirm.\n"
        "5. You'll receive a confirmation email with your order details."
    ),
    "payment": (
        "We accept:\n"
        "- Credit/Debit cards (Visa, Mastercard, Verve)\n"
        "- (Paystack, Flutterwave)\n"
        "- Bank transfer\n"
        "All payments are secure and encrypted."
    ),
    "returns": "We currently do not support returns or exchanges.",
    "discounts": (
        "Current promotions:\n"
        "- 10% off for first-time buyers\n"
        "- Free shipping on orders over ₦50,000\n"
        "- Loyalty points on every purchase (redeemable for discounts)"
    ),
    "account": (
        "For account issues:\n"
        "- Forgot password? Use the 'Forgot Password' link to reset.\n"
        "- Can't log in? Double-check your email/username.\n"
        "- Update profile? Go to Account Settings after logging in."
    ),
}


@tool
def shop_guide(topic: str) -> str:
    """
    General shop guidance for common how-to and policy questions.
    Use this tool when the customer asks about:
    - "checkout"   — how to place an order
    - "payment"    — accepted payment methods
    - "returns"    — return or exchange policy
    - "discounts"  — promotions, offers, loyalty points
    - "account"    — login, password reset, profile settings
    - "fraud"      — customer reporting a security or fraud issue (append details after a colon)
    - "other"      — anything you cannot answer with another tool

    Input examples: "checkout", "payment", "fraud: unauthorized charge on my account"
    """
    key = topic.strip().lower()

    # Handle fraud first so it always logs before anything else
    if key.startswith("fraud"):
        detail = key[5:].lstrip(": ").strip() or topic
        logger.warning(f"[FRAUD REPORT] {detail}")
        return (
            "⚠️ We've flagged this as a security issue. "
            "Our fraud team will review your case and contact you shortly."
        )

    for name, content in _GUIDE_CONTENT.items():
        if key.startswith(name):
            return content

    # Log unmatched topics for visibility
    logger.info(f"[shop_guide] Unmatched topic: '{topic}'")

    detail = topic.removeprefix("other:").removeprefix("other").strip() or topic
    return (
        f"I don't have specific information about '{detail}', but I'm here to help. "
        "Could you provide more details so I can assist you better, "
        "or would you like me to connect you with our support team?"
    )

async def get_all_tools() -> list:
    mcp_tools = await get_mcp_tools()  # search_products, check_order_status, check_stock
    local_tools = [search_faqs, search_policies, escalate_to_human, shop_guide]
    return mcp_tools + local_tools
