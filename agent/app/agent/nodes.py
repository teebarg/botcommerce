from app.agent.tools import get_all_tools
from app.agent.state import AgentState


async def execute_tool_node(state: AgentState) -> AgentState:
    """Generic node that calls the chosen tool (works for 12 out of 14 tools)."""
    tools = get_all_tools()
    tool = next((t for t in tools if t.name == state.intent), None)

    if not tool:
        state.reply = "Sorry, something went wrong finding the right tool."
        return state

    # Special pre-check for refund (follows your original rule)
    if state.intent == "request_refund" and not state.params.get("order_id"):
        state.reply = (
            "Sure, I'd be happy to help with a refund! "
            "Could you please give me the order ID and the reason (e.g. damaged, wrong item)?"
        )
        return state

    # Prepare input for the tool
    invocation_input = state.params
    if not invocation_input:
        invocation_input = {"input": state.message}   # fallback for tools that expect a string

    try:
        result = await tool.ainvoke(invocation_input)

        # Most of your tools already return a user-friendly string or dict
        if isinstance(result, dict):
            state.reply = str(result)   # TODO: pretty-print if you want nicer formatting
        else:
            state.reply = str(result)

        # Nice source names for the frontend
        source_map = {
            "search_products": "Products",
            "search_faqs": "FAQs",
            "search_policies": "Policies",
            "check_order_status": "Order Status",
            "check_stock": "Stock",
            "guide_checkout": "Checkout Guide",
            "guide_payment_methods": "Payment Methods",
            "guide_return_process": "Return Process",
            "guide_discounts": "Discounts",
            "guide_account": "Account Guide",
        }
        state.sources = [source_map.get(state.intent, state.intent.replace("_", " ").title())]

    except Exception as e:
        state.reply = f"Sorry, I had trouble with that request: {str(e)}"

    return state


async def escalate_node(state: AgentState) -> AgentState:
    """Special node for human handover."""
    state.reply = "I'm really sorry I couldn't solve this for you. Let me transfer you to a human agent right now — they'll take care of it!"
    state.escalated = True
    return state


async def fallback_node(state: AgentState) -> AgentState:
    """Fallback tool or generic polite reply."""
    tools = get_all_tools()
    fallback_tool = next((t for t in tools if t.name == "fallback_response"), None)

    if fallback_tool:
        try:
            result = await fallback_tool.ainvoke({"input": state.message})
            state.reply = str(result)
        except Exception:
            state.reply = "I'm sorry, I didn't quite catch that. Could you rephrase? I'm here to help with orders, products, returns, or policies!"
    else:
        state.reply = "I'm sorry, I didn't quite catch that. Could you rephrase? I'm here to help with orders, products, returns, or policies!"

    return state