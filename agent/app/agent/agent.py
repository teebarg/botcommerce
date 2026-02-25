# """
#   1. Agent THINKS about what to do (Thought)
#   2. Agent picks a TOOL and calls it (Action)
#   3. Agent reads the RESULT (Observation)
#   4. Repeat until agent has enough info to answer
# """

# from langchain.agents import AgentExecutor, create_react_agent
# from langchain.prompts import PromptTemplate
# from langchain_core.runnables import RunnableConfig
# import logging
# import uuid

# from app.config import get_llm, get_settings
# from app.agent.tools import get_all_tools
# from app.agent.memory import load_memory_from_redis, save_memory_to_redis

# logger = logging.getLogger(__name__)

# SYSTEM_PROMPT = """You are a friendly, professional customer support agent for an online eshop.
# Your job is to help customers with their orders, product questions, and store policies.

# PERSONALITY:
# - Always be warm, patient, and empathetic
# - Keep responses concise and clear
# - Use the customer's name if you know it
# - Never make up information — if you don't know, say so honestly

# CRITICAL RULES ABOUT WHEN TO USE TOOLS:
# - Simple greetings ("hi", "hello", "hey") → NO tool needed, just greet back warmly
# - Conversational messages ("thanks", "ok", "bye") → NO tool needed, respond naturally
# - Questions about orders, products, policies → USE the appropriate tool
# - NEVER call Action: None — if no tool is needed, go straight to Final Answer
# - NEVER loop or retry the same tool more than once for the same question
# - Before processing a refund, always confirm the order ID and reason with the customer
# - If a customer is angry or you cannot resolve an issue after 2 attempts, use escalate_to_human

# TOOLS AVAILABLE (only use when genuinely needed):
# {tools}

# TOOL NAMES: {tool_names}

# HOW TO RESPOND:

# For conversational messages (greetings, thanks, etc.) — skip tools entirely:
# Question: Hi!
# Thought: This is a greeting, no tool needed.
# Final Answer: Hi there! Welcome to our shop 👋 How can I help you today?

# For questions that need real data — use tools:
# Question: Where is my order #1234?
# Thought: I need to look up this order. I'll use check_order_status.
# Action: check_order_status
# Action Input: 1234
# Observation: Order #1234 status: SHIPPED ...
# Thought: I have the info I need.
# Final Answer: Great news! Your order #1234 has been shipped ...

# CONVERSATION HISTORY:
# {chat_history}

# Question: {input}
# Thought: {agent_scratchpad}"""


# def create_support_agent(session_id: str) -> tuple[AgentExecutor, object]:
#     """
#     Create a configured AgentExecutor for a given session.
#     Returns (executor, memory) — caller must save memory after invoke.
#     """
#     settings = get_settings()
#     llm = get_llm()
#     tools = get_all_tools()
#     memory = load_memory_from_redis(session_id)

#     prompt = PromptTemplate(
#         template=SYSTEM_PROMPT,
#         input_variables=["input", "chat_history", "agent_scratchpad"],
#         partial_variables={
#             "tools": "\n".join([f"- {t.name}: {t.description}" for t in tools]),
#             "tool_names": ", ".join([t.name for t in tools]),
#         },
#     )

#     agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)

#     executor = AgentExecutor(
#         agent=agent,
#         tools=tools,
#         memory=memory,
#         max_iterations=settings.agent_max_iterations,
#         verbose=settings.agent_verbose,
#         # handle_parsing_errors="I couldn't understand that. Could you rephrase your question?"
#         handle_parsing_errors=True,
#         return_intermediate_steps=True,  # needed to extract tool sources
#     )

#     return executor, memory


# async def run_agent(
#     message: str,
#     session_id: str | None = None,
#     customer_id: str | None = None,
# ) -> dict:
#     """
#     Run the agent for a given message and session.
#     Returns a dict with reply, session_id, sources, and escalated flag.
#     """
#     if not session_id:
#         session_id = str(uuid.uuid4())

#     logger.info(f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80]}")

#     # Add customer context to message if available
#     contextualized_message: str = message
#     if customer_id:
#         contextualized_message = f"[Customer ID: {customer_id}] {message}"

#     executor, memory = create_support_agent(session_id)
#     # print("🚀 ~ file: agent.py:114 ~ memory:", memory)
#     # print("🚀 ~ file: agent.py:114 ~ executor:", executor)

#     try:
#         result = executor.invoke(
#             {"input": contextualized_message},
#             config=RunnableConfig(tags=[session_id]),
#         )

#         reply = result.get("output", "")

#         # If agent hit iteration limit, give a sensible fallback
#         if not reply or "agent stopped" in reply.lower() or "iteration limit" in reply.lower():
#             reply = "I'm sorry, I had trouble processing that. Could you rephrase or give me more details?"

#         # Extract which tools were used (for transparency/debugging)
#         sources = []
#         escalated = False

#         for action, observation in result.get("intermediate_steps", []):
#             tool_name = action.tool
#             if tool_name in ("search_products", "search_faqs", "search_policies"):
#                 sources.append(tool_name.replace("search_", "").replace("_", " ").title())
#             if tool_name == "escalate_to_human":
#                 escalated = True

#         save_memory_to_redis(session_id, memory)

#         return {
#             "reply": reply,
#             "session_id": session_id,
#             "sources": list(set(sources)),
#             "escalated": escalated,
#         }

#     except Exception as e:
#         logger.error(f"[Agent] Error for session {session_id}: {e}", exc_info=True)
#         return {
#             "reply": "I'm sorry, something went wrong on my end. Please try again or contact support directly.",
#             "session_id": session_id,
#             "sources": [],
#             "escalated": False,
#         }


"""
agent/agent.py — Core LangChain ReAct agent setup.

Conversational messages (greetings, identity questions, thanks) are handled
directly before hitting the ReAct loop — saves API calls and avoids
parser errors from messages that don't need tool use.
"""

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import HumanMessage, SystemMessage
# from langchain_core.messages import HumanMessage, SystemMessage
import logging
import uuid
import re

from app.config import get_llm, get_settings
from app.agent.tools import get_all_tools
from app.agent.memory import load_memory_from_redis, save_memory_to_redis

logger = logging.getLogger(__name__)

# ── Conversational shortcut ───────────────────────────────────────────────────
# Messages that match these patterns never enter the ReAct loop.
# The LLM answers them directly with a single call — no tool parsing needed.

CONVERSATIONAL_PATTERNS = re.compile(
    r"^\s*(hi+|hey+|hello+|howdy|good\s*(morning|afternoon|evening)|"
    r"who are you|what are you|are you (a |an )?(bot|ai|robot|human|person|agent)|"
    r"what('?s| is) your name|tell me about yourself|"
    r"thanks?|thank you|cheers|ok(ay)?|great|awesome|bye|goodbye|"
    r"help|what can you do|how can you help)\s*[?!.]*\s*$",
    re.IGNORECASE,
)

CONVERSATIONAL_SYSTEM = """You are a friendly human customer support agent named Alex, working for an online shop.

Keep responses short, warm, and natural — like a real person would reply in a chat.

Important:
- Never say you are an AI, bot, robot, or language model
- Never mention Claude, GPT, Groq, or any AI company
- If asked who you are: you're Alex, a support agent for the shop
- If asked what you can do: briefly mention orders, products, returns, policies
- Use the customer's name if provided, keep it casual and friendly
- One or two sentences is enough for simple messages"""


async def _handle_conversational(
    message: str,
    customer_name: str | None,
    llm,
) -> str:
    """Single LLM call for simple messages — bypasses the ReAct loop entirely."""
    context = f"The customer's name is {customer_name}." if customer_name else ""
    messages = [
        SystemMessage(content=CONVERSATIONAL_SYSTEM + ("\n\n" + context if context else "")),
        HumanMessage(content=message),
    ]
    response = await llm.ainvoke(messages)
    return response.content.strip()


# ── ReAct prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Alex, a friendly customer support agent for an online shop.
Never reveal you are an AI, bot, or mention any AI company.

RULES:
- Use tools to look up real information — never invent order details, prices, or policies
- Before processing a refund, confirm the order number and reason with the customer
- If you cannot resolve an issue after 2 attempts, use escalate_to_human
- Keep responses concise and warm
- If a message is unrelated to the shop, politely redirect the customer
to topics about products, orders, or support.

TOOLS:
{tools}

TOOL NAMES: {tool_names}

FORMAT — always follow this exactly:
Thought: reason about what to do
Action: tool_name
Action Input: input for the tool
Observation: tool result
... repeat as needed ...
Thought: I have enough information
Final Answer: your response to the customer

CONVERSATION HISTORY:
{chat_history}

Question: {input}
Thought: {agent_scratchpad}"""


def _create_executor(session_id: str) -> tuple[AgentExecutor, object]:
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
        handle_parsing_errors="I had trouble understanding that. Could you rephrase?",
        return_intermediate_steps=True,
    )

    return executor, memory


async def run_agent(
    message: str,
    session_id: str | None = None,
    customer_id: str | None = None,
) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"[Agent] Session: {session_id} | Customer: {customer_id} | Message: {message[:80]}")

    # ── Conversational shortcut
    if CONVERSATIONAL_PATTERNS.match(message.strip()):
        logger.info("[Agent] Conversational message — skipping ReAct loop")
        llm = get_llm()
        reply = await _handle_conversational(message, customer_id, llm)

        # Still save to memory so context carries forward
        memory = load_memory_from_redis(session_id)
        memory.chat_memory.add_user_message(message)
        memory.chat_memory.add_ai_message(reply)
        save_memory_to_redis(session_id, memory)

        return {
            "reply": reply,
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }

    # ── ReAct agent for everything else ──────────────────────────────────────
    contextualized: str = f"[Customer ID: {customer_id}] {message}" if customer_id else message
    executor, memory = _create_executor(session_id)

    try:
        result = executor.invoke(
            {"input": contextualized},
            config=RunnableConfig(tags=[session_id]),
        )

        reply = result.get("output", "")
        if not reply or "agent stopped" in reply.lower():
            reply = "I'm sorry, I had trouble with that. Could you give me more details?"

        sources, escalated = [], False
        for action, _ in result.get("intermediate_steps", []):
            if action.tool in ("search_products", "search_faqs", "search_policies"):
                sources.append(action.tool.replace("search_", "").replace("_", " ").title())
            if action.tool == "escalate_to_human":
                escalated = True

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
            "reply": "Something went wrong on my end. Please try again or contact support directly.",
            "session_id": session_id,
            "sources": [],
            "escalated": False,
        }
