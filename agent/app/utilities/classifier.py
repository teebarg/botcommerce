import re
from enum import Enum

from semantic_router import Route
from semantic_router.encoders import FastEmbedEncoder
from semantic_router.routers import SemanticRouter

_CONVERSATIONAL_PATTERNS = re.compile(
    r"^\s*(hi+|hey+|hello+|howdy|good\s*(morning|afternoon|evening)|"
    r"who are you|what are you|are you (a |an )?(bot|ai|robot|human|person|agent)|"
    r"what('?s| is) your name|tell me about yourself|"
    r"thanks?|thank you|cheers|ok(ay)?|great|awesome|bye|goodbye|"
    r"help|what can you do|how can you help|"
    r"(good[,.]?\s+)?(what (do you sell|can you help|do you (have|carry|offer|sell)))|"
    r"what('?s| is) (in stock|available|on (sale|offer)))\s*[?!.]*\s*$",
    re.IGNORECASE,
)


class MessageIntent(str, Enum):
    ESCALATION_REQUEST = "escalation_request"
    COMPLAINT = "complaint"
    CONVERSATION = "conversation"
    CONTACT_UPDATE = "contact_update"
    NORMAL = "normal"

escalation_route = Route(
    name=MessageIntent.ESCALATION_REQUEST,
    utterances=[
        "speak to a human", "talk to someone", "human agent", "call me",
        "connect me to a representative", "need to speak with a person",
        "contact support", "get help from a real person", "i want a human"
    ]
)

complaint_route = Route(
    name=MessageIntent.COMPLAINT,
    utterances=[
        "i want to complain", "bad experience", "wrong item received",
        "my package was damaged", "i was overcharged", "poor customer service",
        "unsatisfied with my order", "this is unacceptable", "broken product"
    ]
)

contact_update_route = Route(
    name=MessageIntent.CONTACT_UPDATE,
    utterances=[
        "update my address", "change my email", "update phone number",
        "fix my contact details", "change my shipping info"
    ]
)

conversation_route = Route(
    name=MessageIntent.CONVERSATION,
    utterances=[
        "hi", "hello", "hey there", "good morning", "howdy",
        "who are you?", "what is your name?", "thanks", "thank you",
        "bye", "goodbye", "what can you do?", "how can you help me?",
        "can you be my gf", "will you marry me", "are you single",
        "do you like me", "tell me a joke", "let's be friends",
        "how body", "how far", "you good"
    ]
)


encoder = FastEmbedEncoder(model_name="BAAI/bge-small-en-v1.5")
routes = [escalation_route, complaint_route, contact_update_route, conversation_route]
rl = SemanticRouter(encoder=encoder, routes=routes, auto_sync="local")

rl.update(name=MessageIntent.ESCALATION_REQUEST, threshold=0.85)
rl.update(name=MessageIntent.COMPLAINT, threshold=0.85) # High bar isolates "track my order"
rl.update(name=MessageIntent.CONTACT_UPDATE, threshold=0.78)
rl.update(name=MessageIntent.CONVERSATION, threshold=0.70)

async def _classify_message(message: str) -> MessageIntent:
    choice = rl(message.strip())
    if choice.name is None:
        return MessageIntent.NORMAL
    return MessageIntent(choice.name)
