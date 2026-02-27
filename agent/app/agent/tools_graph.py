"""
Each tool is a function decorated with @tool.
Write docstrings like instructions to a smart employee.

Tools:
  1. search_products     — RAG over product catalog
  2. search_faqs         — RAG over FAQ knowledge base
  3. search_policies     — RAG over return/shipping/warranty policies
  4. check_order_status  — Real-time order lookup via shop API
  5. request_refund      — Initiate a refund via shop API
  6. check_stock         — Check if a product is in stock
  7. escalate_to_human   — Hand off to a human agent
"""
import jwt, time
import httpx
import logging
from langchain.tools import tool
# from langchain_core.tools import tool
from app.rag.qdrant_client import search_collection
from app.config import get_settings

logger = logging.getLogger(__name__)


def _shop_request(method: str, path: str, **kwargs) -> dict:
    """Internal helper for calling shop API."""
    settings = get_settings()
    payload = {
        "sub": "agent",
        "role": "ADMIN",
        "exp": int(time.time()) + 300,
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
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

    output = "Here are the most relevant products I found:\n\n"
    for i, r in enumerate(results, 1):
        output += (
            f"{i}. **{r['name']}** (SKU: {r.get('sku', 'N/A')})\n"
            f"   Image: {r.get('image', '')}\n"
            f"   Price: {r['price']} | Category: {r['category']}\n"
            f"   {r['description']}\n\n"
        )
    return output


@tool
def search_faqs(query: str) -> str:
    """
    Search the FAQ knowledge base for answers to common questions.
    Use when the customer asks about:
    - How something works (payment, checkout, account)
    - General store questions not related to a specific order
    - Questions that might have a standard answer
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
    Search store policies (return policy, shipping policy, warranty).
    Use when the customer asks about:
    - How to return or exchange an item
    - Refund timelines and eligibility
    - Shipping times, costs
    - Warranty coverage
    Input: what policy information the customer needs.
    """
    results = search_collection("policies", query, top_k=2, score_threshold=0.45)

    if not results:
        return "No relevant policy information found."

    return "Here's our relevant policy:\n\n" + "\n\n---\n\n".join(
        r["text"] for r in results
    )

@tool
def check_order_status(order_id: str) -> str:
    """
    Look up the real-time status of a customer order.
    Use when the customer asks:
    - Where is my order?
    - What is the status of order #XXXXX?
    - Has my order shipped?
    - When will my order arrive?
    Input: the order ID number (e.g. 'ORDFCC4E3EB').
    """
    order_id = order_id.strip().lstrip("#").strip()

    result = _shop_request("GET", f"/api/order/{order_id}")
    print("🚀 ~ file: tools.py:136 ~ result:", result)

    if "error" in result:
        return f"Could not retrieve order #{order_id}: {result['error']}"

    # Format order info clearly for the agent to relay
    status = result.get("status", "Unknown")
    tracking = result.get("tracking_number", "Not yet assigned")
    estimated = result.get("estimated_delivery", "Not available")
    items = result.get("order_items", [])

    item_list: str = ", ".join([f"{i.get('name')} x{i.get('quantity', 1)}" for i in items]) or "N/A"

    return (
        f"Order #{order_id} Status: **{status}**\n"
        f"Items: {item_list}\n"
        f"Tracking: {tracking}\n"
        f"Estimated Delivery: {estimated}"
    )


@tool
def check_stock(product_sku: str) -> str:
    """
    Check if a specific product is in stock.
    Use when the customer asks:
    - Is this product available?
    - Do you have [product] in stock?
    - Can I order [product] right now?
    Input: the product SKU code (e.g. 'SHOE-RED-42').
    If you don't have the SKU, use search_products first to find it.
    """
    product_sku = product_sku.strip().upper()
    result = _shop_request("GET", f"/api/products/{product_sku}/stock")

    if "error" in result:
        return f"Could not check stock for SKU '{product_sku}': {result['error']}"

    in_stock = result.get("in_stock", False)
    quantity = result.get("quantity", 0)
    restock_date = result.get("restock_date")

    if in_stock:
        return f"✅ SKU '{product_sku}' is **in stock** ({quantity} units available)."
    else:
        msg = f"❌ SKU '{product_sku}' is currently **out of stock**."
        if restock_date:
            msg += f" Expected restock: {restock_date}."
        return msg


@tool
def request_refund(order_id: str, reason: str) -> str:
    """
    Initiate a refund request for a customer order.
    Only use this tool after:
    1. You have confirmed the order ID with the customer
    2. You have asked for the reason for the refund
    3. You have confirmed the customer wants to proceed
    Input: order_id (numbers only) and reason (customer's explanation).
    """
    order_id = order_id.strip().lstrip("#").strip()

    result = _shop_request(
        "POST",
        "/api/refunds",
        json={"order_id": order_id, "reason": reason},
    )

    if "error" in result:
        return f"Could not process refund for order #{order_id}: {result['error']}"

    refund_id = result.get("refund_id", "N/A")
    timeline = result.get("processing_days", "3-5 business days")

    return (
        f"✅ Refund request submitted successfully!\n"
        f"Refund ID: {refund_id}\n"
        f"Order: #{order_id}\n"
        f"Expected processing time: {timeline}\n"
        f"The customer will receive a confirmation email shortly."
    )


@tool
def escalate_to_human(reason: str) -> str:
    """
    Escalate the conversation to a human support agent.
    Use this tool when:
    - The customer is very angry or upset
    - The issue is complex and beyond your abilities
    - The customer explicitly asks to speak to a human
    - You've tried to help but the customer is not satisfied
    - The issue involves fraud, legal matters, or account security
    Input: a brief summary of the reason for escalation.
    """
    # In production: we will create a ticket in Zendesk/Intercom
    # For now, log and return a message
    logger.warning(f"[ESCALATION] Human agent requested. Reason: {reason}")

    return (
        "ESCALATED_TO_HUMAN: "
        f"I've flagged this conversation for a human agent. Reason: {reason}. "
        "Please let the customer know a human agent will follow up shortly."
    )

@tool
def guide_checkout(dummy: str = "") -> str:
    """
    Explains how a customer can place an order.
    This tool takes no real input. You can pass an empty string.
    """
    return (
        "To place an order:\n"
        "1. Browse the products and select the items you want.\n"
        "2. Add items to your cart.\n"
        "3. Go to checkout.\n"
        "4. Enter shipping and billing information.\n"
        "5. Choose your payment method and confirm the order.\n"
        "6. You'll receive a confirmation email with order details."
    )

@tool
def guide_payment_methods(dummy: str = "") -> str:
    """
    Explains available payment methods.
    Use when the customer asks about:
    - How they can pay
    - Accepted cards, wallets
    Input: pass empty string.
    """
    return (
        "We accept payment via:\n"
        "- Credit/Debit cards (Visa, Mastercard, Verve)\n"
        "- Mobile wallets (Paystack, Flutterwave)\n"
        "- Bank transfer\n"
        "Payments are secure and encrypted."
    )

@tool
def guide_return_process(dummy: str = "") -> str:
    """
    Explains how to request a return or exchange.
    Input: pass empty string.
    """
    return "We currently do not support returns or exchanges."


@tool
def guide_discounts(dummy: str = "") -> str:
    """
    Explains current promotions, sales, or loyalty programs.
    Input: empty string.
    """
    return (
        "Current promotions:\n"
        "- 10% off for first-time buyers\n"
        "- Free shipping on orders over ₦50,000\n"
        "- Loyalty points for every purchase (redeemable for discounts)"
    )

@tool
def guide_account(dummy: str = "") -> str:
    """
    Helps customers with login, password reset, and profile issues.
    Input: empty string.
    """
    return (
        "For account issues:\n"
        "- Forgot password? Use 'Forgot Password' link to reset.\n"
        "- Can't log in? Ensure email/username is correct and try again.\n"
        "- Need to update profile? Go to Account Settings after logging in."
    )

@tool
def report_fraud(issue: str) -> str:
    """
    Customer reports payment or account fraud.
    Input: description of the issue.
    """
    logger.warning(f"[FRAUD REPORT] {issue}")
    return (
        "⚠️ We've flagged this as a security issue. "
        "Our fraud team will review your case and contact you shortly."
    )

@tool
def fallback_response(query: str) -> str:
    """
    Handles any queries that the LLM cannot confidently answer.
    Input: the customer's query.
    """
    return (
        f"I'm not certain about '{query}'. "
        "I've forwarded your question to our support team, "
        "and someone will get back to you soon."
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
        guide_checkout,
        guide_payment_methods,
        guide_return_process,
        guide_discounts,
        guide_account,
        report_fraud,
        fallback_response,
    ]
