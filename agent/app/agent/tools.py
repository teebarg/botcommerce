"""
Each tool is a function decorated with @tool.
The docstring is CRITICAL — the agent reads it to decide when to use the tool.
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

import httpx
import logging
from langchain.tools import tool
from app.rag.qdrant_client import search_collection
from app.config import get_settings

logger = logging.getLogger(__name__)


def _shop_request(method: str, path: str, **kwargs) -> dict:
    """Internal helper for calling shop API."""
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json",
    }
    url: str = f"{settings.api_base_url}{path}"
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
    - Product pricing
    - Product categories
    Input: a natural language search query about the product.
    """
    results = search_collection("products", query, top_k=3, score_threshold=0.45)

    if not results:
        return "No matching products found in our catalog for that query."

    output = "Here are the most relevant products I found:\n\n"
    for i, r in enumerate(results, 1):
        output += (
            f"{i}. **{r['name']}** (SKU: {r.get('sku', 'N/A')})\n"
            f"   Price: ${r['price']} | Category: {r['category']}\n"
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
    - Shipping times, costs, or carriers
    - Warranty coverage
    Input: what policy information the customer needs.
    """
    results = search_collection("policies", query, top_k=2, score_threshold=0.45)

    if not results:
        return "No relevant policy information found."

    return "Here's our relevant policy:\n\n" + "\n\n---\n\n".join(
        r["text"] for r in results
    )


# ── Shop API Tools ──────────────────────────────────────────────────────────

@tool
def check_order_status(order_id: str) -> str:
    """
    Look up the real-time status of a customer order.
    Use when the customer asks:
    - Where is my order?
    - What is the status of order #XXXXX?
    - Has my order shipped?
    - When will my order arrive?
    Input: the order ID number (digits only, e.g. '12345').
    """
    # Strip common prefixes customers might include
    order_id = order_id.strip().lstrip("#").strip()

    if not order_id.isdigit():
        return f"'{order_id}' doesn't look like a valid order ID. Order IDs are numbers only (e.g. 12345). Please ask the customer to double-check."

    result = _shop_request("GET", f"/api/order/{order_id}")

    if "error" in result:
        return f"Could not retrieve order #{order_id}: {result['error']}"

    # Format order info clearly for the agent to relay
    status = result.get("status", "Unknown")
    tracking = result.get("tracking_number", "Not yet assigned")
    carrier = result.get("carrier", "")
    estimated = result.get("estimated_delivery", "Not available")
    items = result.get("items", [])

    item_list: str = ", ".join([f"{i.get('name')} x{i.get('quantity', 1)}" for i in items]) or "N/A"

    return (
        f"Order #{order_id} Status: **{status}**\n"
        f"Items: {item_list}\n"
        f"Tracking: {tracking} ({carrier})\n"
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

    if not order_id.isdigit():
        return f"Invalid order ID '{order_id}'. Please confirm the correct order number."

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

def get_all_tools() -> list:
    return [
        search_products,
        search_faqs,
        search_policies,
        check_order_status,
        check_stock,
        request_refund,
        escalate_to_human,
    ]
