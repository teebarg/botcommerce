from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationSummaryMemory
from .llm import get_llm
from .tools.product_tools import get_product_details
from .tools.order_tools import check_order_status
from .tools.recommendation_tools import recommend_products
from .memory.redis_memory import get_session_memory, save_session_memory
from .memory.postgres_memory import get_user_preferences
from .utils import needs_human_escalation
from .logger import log_interaction

TOOLS = [get_product_details, check_order_status, recommend_products]
CONFIDENCE_THRESHOLD = 0.6
MAX_TOKENS = 2000  # memory summary limit

INTENT_LABELS = ["product_query", "order_status", "recommendation", "other"]

# ------------------------
# Hybrid Intent Classifier
# ------------------------
def classify_intent(message: str, use_llm: bool = True) -> str:
    """
    Rule-based first, fallback to small LLM.
    Returns one of INTENT_LABELS.
    """
    text = message.lower()
    if "order" in text or "tracking" in text:
        return "order_status"
    if "recommend" in text or "suggest" in text:
        return "recommendation"
    if "product" in text or "price" in text or "stock" in text:
        return "product_query"

    if not use_llm:
        return "other"

    try:
        llm = get_llm()
        prompt: str = f"""
        Classify this user message into one of: {', '.join(INTENT_LABELS)}.
        Message: "{message}"
        Return ONLY the label.
        """
        resp = llm(prompt=prompt, max_tokens=10)
        label = resp['choices'][0]['text'].strip().lower()
        return label if label in INTENT_LABELS else "other"
    except Exception:
        return "other"

# ------------------------
# Load memory + preferences
# ------------------------
def load_memory(session_id: str, user_id: int):
    llm = get_llm()
    memory = ConversationSummaryMemory(llm=llm, max_token_limit=MAX_TOKENS)

    # Redis history
    history = get_session_memory(session_id)
    for msg in history:
        memory.chat_memory.add_message(msg)

    # Persistent user preferences
    prefs = get_user_preferences(user_id)
    if prefs:
        memory.chat_memory.add_message({
            "role": "system",
            "content": f"User preferences: {prefs}"
        })

    return memory

# ------------------------
# Run agent (full response)
# ------------------------
def run_agent(session_id: str, user_id: int, user_message: str):
    memory = load_memory(session_id, user_id)
    intent = classify_intent(user_message)

    if intent == "other":
        response = "Sorry, I cannot handle that request. A human agent will contact you shortly."
        memory.chat_memory.add_user_message(user_message)
        memory.chat_memory.add_ai_message(response)
        save_session_memory(session_id, memory.chat_memory.messages)
        log_interaction(session_id, user_message, response, confidence=0.0)
        return response

    llm = get_llm()
    agent = initialize_agent(
        tools=TOOLS,
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,  # works with Llama
        memory=memory,
        verbose=True
    )

    # Run agent
    try:
        response, confidence = agent.run_with_confidence(user_message)
    except AttributeError:
        response = agent.run(user_message)
        confidence = 1.0

    # Human escalation
    if needs_human_escalation(response, confidence, CONFIDENCE_THRESHOLD):
        response = "I’m not confident in my answer. A human agent will contact you shortly."

    # Save memory & log
    save_session_memory(session_id, memory.chat_memory.messages)
    log_interaction(session_id, user_message, response, confidence)

    return response

# ------------------------
# Run agent streaming
# ------------------------
def run_agent_stream(session_id: str, user_id: int, user_message: str):
    """
    Generator for streaming LLM output (typing effect)
    """
    memory = load_memory(session_id, user_id)
    llm = get_llm()

    agent = initialize_agent(
        tools=TOOLS,
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        memory=memory,
        verbose=True
    )

    try:
        for token in agent.stream(user_message):
            yield token
    except Exception:
        yield "[Error streaming response]"

    save_session_memory(session_id, memory.chat_memory.messages)