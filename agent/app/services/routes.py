from enum import Enum

from semantic_router import Route

from app.logging import get_logger

logger = get_logger(__name__)

class MessageIntent(str, Enum):
    ESCALATION_REQUEST = "escalation_request"
    COMPLAINT = "complaint"
    CONTACT_UPDATE = "contact_update"
    POLICY = "policy"
    OFF_TOPIC = "off_topic"
    ORDER_TRACKING = "order_tracking"
    NORMAL = "normal"


# Configure Semantic Router
routes = [
    Route(
        name=MessageIntent.ESCALATION_REQUEST,
        utterances=[
            "speak to a human", "talk to someone", "human agent", "call me",
            "connect me to a representative", "need to speak with a person",
            "contact support", "get help from a real person", "i want a human",
            "talk to a real person", "transfer me to an agent",
        ],
    ),
    Route(
        name=MessageIntent.COMPLAINT,
        utterances=[
            "i want to complain", "bad experience", "wrong item received",
            "my package was damaged", "i was overcharged", "poor customer service",
            "unsatisfied with my order", "this is unacceptable", "broken product",
            "complain", "complaint", "make a complaint", "file a complaint",
        ],
    ),
    Route(
        name=MessageIntent.CONTACT_UPDATE,
        utterances=[
            "update my address", "change my email", "update phone number",
            "fix my contact details", "change my shipping info",
        ],
    ),
    Route(
        name=MessageIntent.POLICY,
        utterances=[
            "what is your return policy", "return policy", "how do i return an item",
            "shipping policy", "how long does shipping take", "refund policy",
        ],
    ),
    Route(
        name=MessageIntent.OFF_TOPIC,
        utterances=[
            "hi", "hello", "hey there", "good morning", "thanks", "thank you",
            "bye", "goodbye", "how body", "how far", "you good", "ok",
            "what is the capital of nigeria", "tell me a joke", "who is the president",
            "what is 2 + 2", "write me a poem", "i need therapy", "relationship advice",
        ],
    ),
]
