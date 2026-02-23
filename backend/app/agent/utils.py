from .llm import get_llm  # your existing Llama provider

def classify_intent(message: str) -> str:
    """
    Simple rule-based classifier (replace with small LLM if needed)
    Returns: 'product_query', 'order_status', 'recommendation', 'other'
    """
    text: str = message.lower()
    if "order" in text or "tracking" in text:
        return "order_status"
    if "recommend" in text or "suggest" in text:
        return "recommendation"
    if "product" in text or "price" in text or "stock" in text:
        return "product_query"
    return "other"


INTENT_LABELS = ["product_query", "order_status", "recommendation", "other"]

def classify_intent_llm(message: str) -> str:
    """
    Use a small LLM to classify the intent of a single message.
    Returns one of INTENT_LABELS.
    """
    llm = get_llm()  # Ollama/Llama
    prompt: str = f"""
        Classify the user message into one of: {', '.join(INTENT_LABELS)}.
        Message: "{message}"
        Return only the label.
    """
    result = llm(prompt)
    return result.strip()


def needs_human_escalation(llm_response: str, confidence: float, threshold: float = 0.6) -> bool:
    """
    Returns True if the confidence is below threshold or response indicates uncertainty.
    """
    uncertain_keywords = ["not sure", "cannot", "unknown", "sorry"]
    if confidence < threshold or any(word in llm_response.lower() for word in uncertain_keywords):
        return True
    return False