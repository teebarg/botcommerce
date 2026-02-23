"""
  1. Agent THINKS about what to do (Thought)
  2. Agent picks a TOOL and calls it (Action)
  3. Agent reads the RESULT (Observation)
  4. Repeat until agent has enough info to answer
"""

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableConfig
import logging
import uuid

from app.config import get_llm, get_settings
from app.agent.tools import get_all_tools
from app.agent.memory import load_memory_from_redis, save_memory_to_redis

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a friendly, professional customer support agent for an online shop.
Your job is to help customers with their orders, product questions, and store policies.

PERSONALITY:
- Always be warm, patient, and empathetic
- Keep responses concise and clear
- Use the customer's name if you know it
- Never make up information — if you don't know, say so honestly

RULES:
- ALWAYS use the available tools to look up real information
- NEVER invent order statuses, prices, or policy details
- Before processing a refund, always confirm the order ID and reason with the customer
- If a customer is angry or you cannot resolve an issue after 2 attempts, use escalate_to_human
- If asked something outside your scope (e.g. personal questions), politely redirect

TOOLS AVAILABLE:
{tools}

TOOL NAMES: {tool_names}

HOW TO RESPOND:
Use this exact format:

Question: the customer's message you need to respond to
Thought: think about what information you need and which tool to use
Action: the tool name to use (must be one of: {tool_names})
Action Input: the input to pass to the tool
Observation: the result from the tool
... (you can repeat Thought/Action/Observation as needed)
Thought: I now have enough information to help the customer
Final Answer: your friendly, helpful response to the customer

CONVERSATION HISTORY:
{chat_history}

Question: {input}
Thought: {agent_scratchpad}"""


def create_support_agent(session_id: str) -> tuple[AgentExecutor, object]:
    """
    Create a configured AgentExecutor for a given session.
    Returns (executor, memory) — caller must save memory after invoke.
    """
    settings = get_settings()
    llm = get_llm()
    tools = get_all_tools()
    memory = load_memory_from_redis(session_id)

    prompt = PromptTemplate(
        template=SYSTEM_PROMPT,
        input_variables=["input", "chat_history", "agent_scratchpad"],
        partial_variables={
            "tools": "\n".join([f"- {t.name}: {t.description}" for t in tools]),
            "tool_names": ", ".join([t.name for t in tools]),
        },
    )

    agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)

    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        memory=memory,
        max_iterations=settings.agent_max_iterations,
        verbose=settings.agent_verbose,
        handle_parsing_errors=True,   # prevents crashes on malformed LLM output
        return_intermediate_steps=True,  # needed to extract tool sources
    )

    return executor, memory


async def run_agent(
    message: str,
    session_id: str | None = None,
    customer_id: str | None = None,
) -> dict:
    """
    Run the agent for a given message and session.
    Returns a dict with reply, session_id, sources, and escalated flag.
    """
    # Auto-generate session ID if not provided
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80]}")

    # Add customer context to message if available
    contextualized_message: str = message
    if customer_id:
        contextualized_message = f"[Customer ID: {customer_id}] {message}"

    executor, memory = create_support_agent(session_id)

    try:
        result = executor.invoke(
            {"input": contextualized_message},
            config=RunnableConfig(tags=[session_id]),
        )

        reply = result.get("output", "I'm sorry, I couldn't process your request. Please try again.")

        # Extract which tools were used (for transparency/debugging)
        sources = []
        escalated = False
        intermediate_steps = result.get("intermediate_steps", [])

        for action, observation in intermediate_steps:
            tool_name = action.tool
            if tool_name in ("search_products", "search_faqs", "search_policies"):
                sources.append(tool_name.replace("search_", "").replace("_", " ").title())
            if tool_name == "escalate_to_human":
                escalated = True

        # Persist updated memory
        save_memory_to_redis(session_id, memory)

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": list(set(sources)),
            "escalated": escalated,
        }

    except Exception as e:
        logger.error(f"[Agent] Error for session {session_id}: {e}", exc_info=True)
        return {
            "reply": "I'm sorry, something went wrong on my end. Please try again or contact support directly.",
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }
