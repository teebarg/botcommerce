from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.router import route_message
from app.agent.nodes import execute_tool_node, escalate_node, fallback_node
from app.config import get_llm


async def router_node(state: AgentState) -> dict:
    """
    Router node - returns dict with updated fields
    """
    updated_state = await route_message(state, get_llm())
    # route_message should already set intent & params
    return {
        "intent": updated_state.intent,
        "params": updated_state.params,
    }


def build_support_graph():
    """
    Build and compile the graph.
    No fancy compile arguments → just plain compile()
    """
    graph = StateGraph(AgentState)

    # Register nodes (all should return dict)
    graph.add_node("router", router_node)
    graph.add_node("execute_tool", execute_tool_node)
    graph.add_node("escalate", escalate_node)
    graph.add_node("fallback", fallback_node)

    graph.set_entry_point("router")

    # Conditional routing based on intent
    def route_after_classifier(state: AgentState) -> str:
        if state.intent == "escalate_to_human":
            return "escalate"
        if state.intent == "fallback_response":
            return "fallback"
        return "execute_tool"  # most intents go here

    graph.add_conditional_edges(
        "router",
        route_after_classifier,
        {
            "execute_tool": "execute_tool",
            "escalate": "escalate",
            "fallback": "fallback",
        }
    )

    # All terminal nodes go to END
    graph.add_edge("execute_tool", END)
    graph.add_edge("escalate", END)
    graph.add_edge("fallback", END)

    # Compile without any extra arguments
    return graph.compile()