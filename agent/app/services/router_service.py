import logging
import re
from enum import Enum
from pathlib import Path

import anyio
import joblib
import numpy as np
from fastembed import TextEmbedding
from semantic_router import Route
from semantic_router.encoders import FastEmbedEncoder
from semantic_router.routers import SemanticRouter

logger = logging.getLogger("intent_router")

class MessageIntent(str, Enum):
    ESCALATION_REQUEST = "escalation_request"
    COMPLAINT = "complaint"
    CONVERSATION = "conversation"
    CONTACT_UPDATE = "contact_update"
    POLICY = "policy"
    OFF_TOPIC = "off_topic"
    ORDER_TRACKING = "order_tracking"
    NORMAL = "normal"


_ORDER_NUMBER_RE = re.compile(
    r"\b(?:ORD[-\s]?)([A-Z0-9]{5,12})\b",
    re.IGNORECASE,
)

def extract_order_number(message: str) -> str | None:
    match = _ORDER_NUMBER_RE.search(message)
    if not match:
        return None
    raw = match.group(0).upper().replace(" ", "")
    if raw.startswith("ORD-"):
        return raw
    if raw.startswith("ORD"):
        return "ORD-" + raw[3:]
    return "ORD-" + raw


class IntentRouterService:
    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)
        self.embedder: TextEmbedding | None = None
        self.encoder: FastEmbedEncoder | None = None
        self.clf = None
        self.rl: SemanticRouter | None = None

    def load_models(self) -> None:
        """Synchronous initialization called during app startup."""
        logger.info("Loading FastEmbed models and classifiers...")
        
        # Load embedding model once
        self.embedder = TextEmbedding("BAAI/bge-small-en-v1.5")
        
        # Load trained classifier artifact
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model artifact missing at {self.model_path}")
        self.clf = joblib.load(self.model_path)

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
                name=MessageIntent.CONVERSATION,
                utterances=[
                    "hi", "hello", "hey there", "good morning", "thanks", "thank you",
                    "bye", "goodbye", "how body", "how far", "you good", "ok",
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
                    "what is the capital of nigeria", "tell me a joke", "who is the president",
                    "what is 2 + 2", "write me a poem", "i need therapy", "relationship advice",
                ],
            ),
        ]

        self.encoder = FastEmbedEncoder(model_name="BAAI/bge-small-en-v1.5")
        self.rl = SemanticRouter(encoder=self.encoder, routes=routes, auto_sync="local")
        
        self.rl.update(name=MessageIntent.ESCALATION_REQUEST, threshold=0.85)
        self.rl.update(name=MessageIntent.COMPLAINT, threshold=0.82)
        self.rl.update(name=MessageIntent.CONTACT_UPDATE, threshold=0.78)
        self.rl.update(name=MessageIntent.CONVERSATION, threshold=0.70)
        self.rl.update(name=MessageIntent.POLICY, threshold=0.75)
        self.rl.update(name=MessageIntent.OFF_TOPIC, threshold=0.72)
        
        logger.info("IntentRouterService initialization complete.")

    def _sync_embed(self, text: str) -> np.ndarray:
        return np.array(list(self.embedder.embed([text])))

    def _sync_is_in_scope(self, msg: str, cutoff: float = 0.5) -> bool:
        vec = self._sync_embed(msg)
        p_in = self.clf.predict_proba(vec)[0][1]
        return p_in >= cutoff

    async def classify(self, message: str) -> tuple[MessageIntent, str | None]:
        msg = (message or "").strip()
        if not msg:
            return MessageIntent.CONVERSATION, None

        # 1. Regex Fast Path
        order_number = extract_order_number(msg)
        if order_number:
            return MessageIntent.ORDER_TRACKING, order_number

        # 2. Semantic Router Evaluation (Offloaded to thread pool to prevent event loop blocking)
        choice = await anyio.to_thread.run_sync(self.rl, msg)

        if choice.name is not None:
            return MessageIntent(choice.name), None

        # 3. Scope Classifier Fallback (Offloaded to thread pool)
        in_scope = await anyio.to_thread.run_sync(self._sync_is_in_scope, msg)
        intent = MessageIntent.NORMAL if in_scope else MessageIntent.OFF_TOPIC
        return intent, None