import numpy as np
from fastembed import embed_texts

# Define intents → tool mapping
INTENT_MAP = {
    "search_product": "search_products",
    "faq": "search_faqs",
    "policy": "search_policies",
    "order_status": "check_order_status",
    "refund": "request_refund",
    "checkout": "guide_checkout",
    "payment": "guide_payment_methods",
    "return": "guide_return_process",
    "shipping": "calculate_shipping",
    "discounts": "guide_discounts",
    "account": "guide_account",
    "fraud": "report_fraud",
    "escalation": "escalate_to_human",
}

# Sample embedding prompts for each intent
INTENT_EXAMPLES = {
    "search_product": ["Do you have red sneakers?", "Show me jackets", "I want to buy a bag"],
    "faq": ["How do I reset my password?", "What is your return policy?"],
    "order_status": ["Where is my order #123?", "Has my package shipped?"],
    "refund": ["I want to return my order", "I need a refund for order #456"],
    "checkout": ["How do I place an order?", "Guide me to checkout"],
    "payment": ["Can I pay with PayPal?", "Do you accept card payments?"],
    "return": ["How do I return an item?", "I want to exchange a product"],
    "shipping": ["How much to ship to Lagos?", "Delivery time to Abuja?"],
    "discounts": ["Any promo codes?", "Are there any discounts?"],
    "account": ["I forgot my password", "Can't log in"],
    "fraud": ["I think my card was charged twice", "Suspicious activity on my account"],
    "escalation": ["I want to speak to a human", "Connect me to support"],
}

# Precompute embeddings for examples (once at startup)
EMBEDDINGS = {}
for intent, examples in INTENT_EXAMPLES.items():
    EMBEDDINGS[intent] = embed_texts(examples)  # fastembed with all-MiniLM-L6-v2

def detect_intent(query: str) -> str | None:
    """
    Returns the most likely intent or None if confidence is low.
    """
    query_vec = embed_texts([query])[0]
    best_intent, best_score = None, 0.0

    for intent, vectors in EMBEDDINGS.items():
        # Cosine similarity
        sims = np.dot(vectors, query_vec) / (np.linalg.norm(vectors, axis=1) * np.linalg.norm(query_vec))
        max_sim = sims.max()
        if max_sim > best_score:
            best_score = max_sim
            best_intent = intent

    if best_score < 0.65:  # threshold for confidence
        return None

    return best_intent