import json
import jwt
import time
import httpx
import logging
from langchain.tools import tool
from app.rag.qdrant_client import search_collection
from app.config import get_settings

logger = logging.getLogger(__name__)


def _shop_request(method: str, path: str, **kwargs) -> dict:
    """Internal helper for calling the shop API with a short-lived JWT."""
    settings = get_settings()
    token = jwt.encode(
        {"sub": "agent", "role": "ADMIN", "exp": int(time.time()) + 300},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url: str = f"{settings.API_BASE_URL}{path}"
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.request(method, url, headers=headers, **kwargs)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"API error: {e.response.status_code} — {e.response.text}")
        return {"error": f"API error {e.response.status_code}: {e.response.text}"}
    except httpx.RequestError as e:
        logger.error(f"API connection error: {e}")
        return {"error": "Could not connect to the API. Please try again."}


@tool
def search_products(query: str) -> str:
    """
    Search the product catalog for information about products.
    Use when the customer asks about:
    - What products are available
    - Product features, specs, or descriptions
    - Product pricing or categories
    Input: a natural language search query about the product.
    """
    results = search_collection("products", query, top_k=5, score_threshold=0.45)
    if not results:
        return "No matching products found in our catalog for that query."

    # Return both human-readable text AND structured JSON the agent can use
    output = "Here are the most relevant products I found:\n\n"
    for i, r in enumerate(results, 1):
        output += (
            f"{i}. **{r['name']}** (SKU: {r.get('sku', 'N/A')})\n"
            f"   - Image: {r.get('image', '')}\n"
            f"   - Price: {r['price']} | Category: {r['category']}\n"
            f"   - {r['description']}\n\n"
        )

    structured = [
        {
            "name": r["name"],
            "sku": r.get("sku", ""),
            "image_url": r.get("image", "") or None,
            "price": str(r["price"]),
            "description": r.get("description", ""),
        }
        for r in results
    ]
    output += f"\n<!-- PRODUCTS_JSON:{json.dumps(structured)} -->"
    return output


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
def check_order_status(order_id: str) -> str:
    """
    Look up the real-time status of a customer order.
    Use when the customer asks:
    - Where is my order?
    - What is the status of order #XXXXX?
    - Has my order shipped / when will it arrive?
    Input: the order ID (e.g. 'ORDFCC4E3EB').
    """
    order_id = order_id.strip().lstrip("#").strip()
    result = _shop_request("GET", f"/api/order/{order_id}")

    if "error" in result:
        return f"Could not retrieve order #{order_id}: {result['error']}"

    item_list = ", ".join(
        f"{i.get('name')} x{i.get('quantity', 1)}" for i in result.get("order_items", [])
    ) or "N/A"

    return (
        f"Order #{order_id} Status: **{result.get('status', 'Unknown')}**\n"
        f"Items: {item_list}\n"
        f"Tracking: {result.get('tracking_number', 'Not yet assigned')}\n"
        f"Estimated Delivery: {result.get('estimated_delivery', 'Not available')}"
    )


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

    msg: str = f"❌ Slug '{product_slug}' is currently **out of stock**."
    if result.get("restock_date"):
        msg += f" Expected restock: {result['restock_date']}."
    return msg


@tool
def request_refund(order_id: str, reason: str) -> str:
    """
    Initiate a refund request for a customer order.
    Only call this tool after you have:
    1. Confirmed the order ID with the customer
    2. Asked for and received the reason for the refund
    3. Confirmed the customer wants to proceed
    Input: order_id and reason.
    """
    order_id = order_id.strip().lstrip("#").strip()
    result = _shop_request("POST", "/api/refunds", json={"order_id": order_id, "reason": reason})

    if "error" in result:
        return f"Could not process refund for order #{order_id}: {result['error']}"

    return (
        f"✅ Refund submitted!\n"
        f"Refund ID: {result.get('refund_id', 'N/A')}\n"
        f"Order: #{order_id}\n"
        f"Processing time: {result.get('processing_days', '3-5 business days')}\n"
        f"A confirmation email will be sent to the customer shortly."
    )


@tool
def escalate_to_human(reason: str) -> str:
    """
    Escalate the conversation to a human support agent.
    Use when:
    - The customer is angry or upset
    - The issue is too complex to resolve with available tools
    - The customer explicitly asks to speak to a human
    - The issue involves fraud, legal matters, or account security
    Input: a brief summary of why escalation is needed.
    """
    logger.warning(f"[ESCALATION] {reason}")
    return (
        "ESCALATED_TO_HUMAN: "
        f"I've flagged this for a human agent. Reason: {reason}. "
        "A human agent will follow up with the customer shortly."
    )


# ── Consolidated guide tool
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

    for name, content in _GUIDE_CONTENT.items():
        if key.startswith(name):
            return content

    if key.startswith("fraud"):
        detail = key[5:].lstrip(": ").strip() or topic
        logger.warning(f"[FRAUD REPORT] {detail}")
        return (
            "⚠️ We've flagged this as a security issue. "
            "Our fraud team will review your case and contact you shortly."
        )

    detail = topic.lstrip("other:").strip() or topic
    return (
        f"I've noted your question about '{detail}' and passed it to our support team. "
        "Someone will follow up with you shortly."
    )

def get_all_tools() -> list:
    return [
        search_products,
        search_faqs,
        search_policies,
        check_order_status,
        check_stock,
        request_refund,
        escalate_to_human,
        shop_guide,
    ]
