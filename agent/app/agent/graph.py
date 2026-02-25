from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.router import route_message
from app.agent.nodes import execute_tool_node, escalate_node, fallback_node


def build_support_graph(llm):
    """Build and compile the graph. Call this once per request (or cache it)."""
    graph = StateGraph(AgentState)

    # Nodes
    graph.add_node("router", lambda s: route_message(s, llm))
    graph.add_node("execute_tool", execute_tool_node)
    graph.add_node("escalate", escalate_node)
    graph.add_node("fallback", fallback_node)

    graph.set_entry_point("router")

    # Conditional routing after the classifier
    def route_after_classifier(state: AgentState):
        if state.intent == "escalate_to_human":
            return "escalate"
        if state.intent == "fallback_response":
            return "fallback"
        return "execute_tool"   # everything else

    graph.add_conditional_edges(
        "router",
        route_after_classifier,
        {
            "execute_tool": "execute_tool",
            "escalate": "escalate",
            "fallback": "fallback",
        }
    )

    # All paths end here
    graph.add_edge("execute_tool", END)
    graph.add_edge("escalate", END)
    graph.add_edge("fallback", END)

    return graph.compile()