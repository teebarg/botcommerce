import json
import jwt
import time
import httpx
import logging
from langchain_classic.tools import tool
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
    Search the product catalog for products.
    Returns compact product summaries for agent reasoning.
    """
    if not query or not query.strip():
        return "No query provided. Ask the customer what they're looking for."
        
    results = search_collection("products", query, top_k=3, score_threshold=0.45)
    if not results:
        return "No matching products found."

    summary_lines: list[str] = []
    structured = []

    for r in results:
        summary_lines.append(
            f"- {r['name']} (SKU: {r.get('sku','N/A')}) | Price: {r['price']} | Category: {r['category']}"
        )

        structured.append({
            "id": r.get("product_id", 0),
            "variant_id": r.get("variant_id", 0),
            "name": r["name"],
            "sku": r.get("sku", ""),
            "price": str(r["price"]),
            "image_url": r.get("image") or None
        })

    output = "Top matching products:\n"
    output += "\n".join(summary_lines)

    output += f"\n\n<!-- PRODUCTS_JSON:{json.dumps(structured, separators=(',', ':'))} -->"
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
def check_order_status(order_number: str) -> str:
    """
    Look up the real-time status of a customer order.

    Use when the customer asks:
    - Where is my order?
    - What is the status of order #XXXXX?
    - Has my order been delivered?
    - Is my payment confirmed?

    Input: the order number (e.g. 'ORDFCC4E3EB').
    """

    order_number = order_number.strip().lstrip("#").strip().upper()
    result = _shop_request("GET", f"/api/order/{order_number}")

    if "error" in result:
        return f"Could not retrieve order #{order_number}: {result['error']}"

    status = (result.get("status") or "PENDING").upper()
    payment_status = (result.get("payment_status") or "PENDING").upper()

    items_payload = []
    for item in result.get("order_items", []):
        items_payload.append({
            "product_id": item.get("product_id"),
            "name": item.get("name"),
            "image": item.get("image"),
            "quantity": item.get("quantity", 1),
            "price": item.get("price"),
        })

    order_payload = {
        "order_number": order_number,
        "status": status,
        "payment_status": payment_status,
        "payment_method": result.get("payment_method"),
        "shipping_method": result.get("shipping_method"),
        "financials": {
            "subtotal": result.get("subtotal"),
            "tax": result.get("tax"),
            "discount": result.get("discount_amount"),
            "wallet_used": result.get("wallet_used"),
            "shipping_fee": result.get("shipping_fee"),
            "total": result.get("total"),
        },
        "items": items_payload,
        "created_at": result.get("created_at"),
    }

    human_summary: str = (
        f"Order #{order_number} is currently **{status.replace('_', ' ')}**.\n"
        f"Payment Status: **{payment_status.replace('_', ' ')}**\n"
        f"Order value: {result.get('total')}\n"
        f"Placed On: {result.get('created_at')}"
    )

    return (
        human_summary
        + "\n\n<!-- ORDERS_JSON: "
        + json.dumps(order_payload)
        + " -->"
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

    return f"❌ Slug '{product_slug}' is currently **out of stock**."


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
