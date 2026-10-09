"""
E-Commerce Intent Classifier & Router
====================================

This module provides a multi-tiered intent routing engine for an e-commerce assistant, 
supporting standard English and Nigerian Pidgin / local colloquialisms.

Architecture Overview:
----------------------
1. Normalization Tier: Standardizes slang, Pidgin expressions, and common spelling variants.
2. Deterministic Regex Tiers (Tiers 1-6): Fast-path rule evaluation for unambiguous high-intent 
   queries (Product Inquiry, Identity, Human Escalation, Order Issues, Complaints, Policies).
3. Rule Guard Tier (Tier 7): Filters off-topic non-fashion items before vector matching.
4. Semantic Embedding Tier (Tier 8): Fallback dense vector similarity search (BAAI/bge-small-en-v1.5) 
   for ambiguous or multi-phrase natural language inputs.
"""

import re
from enum import Enum

import numpy as np
from fastembed import TextEmbedding


class MessageIntent(str, Enum):
    """
    Supported intent categories driving downstream state-machine routing.

    Attributes:
        CONVERSATION: Casual chit-chat, bot identity, non-transactional chatter.
        PRODUCT_INQUIRY: Browsing catalog, category requests, availability checks.
        PRODUCT_DETAILS: Queries regarding specific item attributes (price, size, material).
        POLICY: Static FAQ queries (payment options, delivery rates, return rules).
        ORDER_ISSUE: Order tracking, missing packages, delivery status (triggers DB lookup).
        COMPLAINT: Customer dissatisfaction, post-purchase grievances, bad service reports.
        ESCALATION_REQUEST: Explicit requests for human agent support.
        NORMAL: Off-topic or non-catalog queries outside scope.
    """
    CONVERSATION = "conversation"
    PRODUCT_INQUIRY = "product_inquiry"
    PRODUCT_DETAILS = "product_details"
    POLICY = "policy"
    ORDER_ISSUE = "order_issue"
    COMPLAINT = "complaint"
    ESCALATION_REQUEST = "escalation_request"
    NORMAL = "normal"


class ProductionECommerceRouter:
    """
    Hybrid Intent Classifier leveraging regex rules and dense embeddings.

    Attributes:
        encoder (TextEmbedding): Pre-initialized embedding model (bge-small-en-v1.5).
        slang_map (dict): Regex mapping of colloquial/Pidgin patterns to standard English.
        off_topic_items (set): Blacklist keywords outside product scope (e.g., houses, cars).
        vector_db (list): Reference embedding vectors paired with their respective MessageIntent.
    """

    def __init__(self):
        """Initialize the embedding model, compile regex patterns, and index vector anchors."""

        self.encoder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

        # ----------------------------------------------------------------------
        # Slang & Pidgin Normalization Map
        # ----------------------------------------------------------------------
        # Maps local vernacular to standardized English prior to pattern evaluation.
        # Order matters: higher specificity regex rules should appear before general ones.
        self.slang_map = {
            r"\buna\s+dey\b": "do you",
            r"\bdey\b": "is",
            r"\bwan\b": "want to",
            r"\bno\s+get\b": "dont have",
            # Preserves pattern for order tracking rules
            r"\bnever\s+reach\b": "never arrived",
            r"\bwhen\s+e\s+reach\b": "on delivery",  # Normalizes delivery timing slang
            r"\breach\b": "arrive",
            r"\btoo\s+cost\b": "too expensive",
            r"\babeg\b": "please",
            r"\bbe\s+this\b": "is this",
            r"\byou\s+get\b": "do you have",
            r"\be\b": "it",
            r"\bam\b": "it",
            r"\bu\b": "you",
        }

        # ----------------------------------------------------------------------
        # Out-of-Scope Product Category Guard
        # ----------------------------------------------------------------------
        # Used to reject queries asking for items outside the fashion catalog.
        self.off_topic_items = {
            "house", "houses", "phone", "phones", "laptop", "laptops",
            "electronics", "food", "furniture", "wig", "wigs", "car", "land"
        }

        # ----------------------------------------------------------------------
        # Deterministic Regex Rules (Ordered by Priority)
        # ----------------------------------------------------------------------

        # Tier 1: General Product Discovery & Catalog Browsing
        self.product_inquiry_patterns = [
            r"do\s+(you|u)\s+(have|sell)\s+(dresses|gowns|tops|shoes|bags|clothes)",
            r"what\s+(products|clothes|items)\s+do\s+you\s+have",
            r"what\s+do\s+you\s+have(\s+in\s+stock)?",
            r"show\s+me\s+what\s+you\s+have",
            r"what'?s\s+available",
            r"what\s+are\s+you\s+selling",
            r"recommend\s+something",
            r"new\s+arrivals",
            r"what'?s\s+trending",
        ]

        # Tier 2: Bot Identity & Conversational Meta Queries
        self.identity_patterns = [
            r"are\s+you\s+(a\s+)?(real\s+person|human|bot|ai)",
            r"am\s+i\s+talking\s+to\s+a\s+(human|bot|real\s+person)",
            r"who\s+am\s+i\s+(chatting|talking)\s+with",
            r"is\s+this\s+(a\s+)?(bot|customer\s+service)",
            r"what\s+are\s+you",
            r"who\s+are\s+you",
            r"what\s+is\s+your\s+name",
            r"what\s+can\s+you\s+help\s+me\s+with",
            r"tell\s+me\s+about\s+yourself",
        ]

        # Tier 3: Human Agent Handoff Requests
        self.human_escalation_patterns = [
            r"speak\s+to\s+(an?\s+)?(agent|human|person|someone)",
            r"talk\s+to\s+(an?\s+)?(agent|human|person|someone)",
            r"connect\s+me\s+to\s+(a\s+)?(human|agent|person|customer\s+service)",
            r"i\s+need\s+a\s+real\s+person",
            r"get\s+me\s+a\s+(human|person|agent)",
            r"bot\s+is\s*n'?t\s+helping",
            r"transfer\s+me\s+to\s+an?\s+agent",
            r"let\s+me\s+talk\s+to\s+someone",
        ]

        # Tier 4: Specific Order Tracking & Fulfillment Issues
        self.order_issue_patterns = [
            r"where\b.*\border",
            r"order\s+#?\d+",
            r"order\s+(hasn'?t|never|didn'?t)\s+(arrived|reach)",
            r"missing\s+order",
            r"track\b.*\border",
            r"check\b.*\border\s+status",
            r"package\s+(is\s+late|arrived\s+damaged)",
            r"order\s+is\s+taking\s+too\s+long",
            r"waiting\s+for\s+my\s+order",
            r"haven'?t\s+received\b.*\border",
            r"what\s+happened\s+to\s+my\s+order",
            r"my\s+order\s+never\s+(arrived|reach)",
        ]

        # Tier 5: Explicit Expressions of Grievance/Dissatisfaction
        self.complaint_patterns = [
            r"(not|un)\s*happy\s+with\b.*\border",
            r"disappointed\s+with\b.*\border",
            r"bad\s+(experience|service|quality)",
            r"terrible\s+(experience|service|quality)",
            r"horrible\s+(experience|service|quality)",
            r"waste\s+of\s+money",
            r"i\s+want\s+to\s+complain",
        ]

        # Tier 6: Static FAQ Policies (Delivery Rules, Payment Options, Returns)
        self.policy_patterns = [
            r"(can|do)\s+you\s+(deliver|do\s+home\s+delivery)",
            r"deliver\s+to\s+my\s+(house|location|address)",
            r"how\s+long\s+does\s+delivery\s+take",
            r"delivery\s+(fee|charge|cost|policy|options)",
            r"shipping\s+(fee|cost|policy)",
            r"how\s+much\s+is\s+delivery",
            r"(is|do\s+you\s+accept|do\s+you\s+allow)\s+payment\s+on\s+delivery",
            r"payment\s+on\s+delivery\s+(available|accepted|allowed|option)?",
            r"can\s+i\s+pay\s+(when\s+it\s+arrives|on\s+delivery|when\s+e\s+reach)",
            r"cash\s+on\s+delivery",
            r"payment\s+method",
            r"return\s+policy",
            r"refund\s+policy",
            r"can\s+i\s+return",
            r"can\s+i\s+exchange",
        ]

        # ----------------------------------------------------------------------
        # Dense Vector Reference Anchors (Tier 8 Fallback)
        # ----------------------------------------------------------------------
        # Carefully curated reference phrases used for similarity search when
        # queries pass all regex tiers without matching.
        self.anchors = {
            MessageIntent.CONVERSATION: [
                "hello hi hey good morning", "do you have a boyfriend", "i dont have money",
                "i am broke", "can we be friends", "how old are you", "are you married",
                "where do you live", "what is your favorite color", "i love you",
                "hey there", "howdy", "who are you?", "what is your name?", "thanks", "thank you",
                "bye", "goodbye", "what can you do?", "how can you help me?", "can you be my gf",
                "will you marry me", "are you single", "do you like me", "tell me a joke",
                "let's be friends", "how body", "how far", "you good"
            ],
            MessageIntent.PRODUCT_INQUIRY: [
                "show me your tops", "do you sell gowns", "what clothes do you sell",
                "what is in stock", "show me new arrivals", "any gowns available",
                "looking for a party dress", "do you have anything in my size", "do you have shoes?"
            ],
            MessageIntent.PRODUCT_DETAILS: [
                "is this available", "how much is this", "what is the price",
                "do you have this in black", "is size 12 available", "what material is this",
                "is this true to size", "how much does it cost"
            ],
            MessageIntent.POLICY: [
                "how do i place an order", "how do i checkout",
                "can i order through whatsapp", "how do i add this to my cart", "i want to complete purchase"
            ],
            MessageIntent.COMPLAINT: [
                "i am furious and angry", "terrible experience unacceptable customer service",
                "this item is broken and ruined", "overcharged bad customer support",
                "i am not happy with my order", "very disappointed with order quality",
                "i want to complain", "bad experience", "wrong item received", "my package was damaged",
                "i was overcharged", "poor customer service", "unsatisfied with my order", 
                "this is unacceptable", "broken product", "complain", "complaint", "make a complaint", 
                "file a complaint", "wrong item", "unsatisfied", "unhappy with"
            ]
        }

        # Index vector embeddings in memory during initialization
        self.vector_db = []
        for intent, phrases in self.anchors.items():
            vecs = list(self.encoder.embed(phrases))
            for v in vecs:
                self.vector_db.append((v, intent))

    def _normalize(self, text: str) -> str:
        """
        Cleans input string and applies Pidgin/slang transformations.

        Args:
            text (str): Raw user message input.

        Returns:
            str: Normalized lowercase text with substituted standard terms.
        """
        clean = text.strip().lower()
        for pattern, replacement in self.slang_map.items():
            clean = re.sub(pattern, replacement, clean)
        return clean

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Computes cosine similarity score between two dense vectors."""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def classify(self, message: str) -> MessageIntent:
        """
        Classifies an incoming user string into a defined MessageIntent.

        Evaluates input sequentially across 8 distinct decision tiers.

        Args:
            message (str): Incoming customer message.

        Returns:
            MessageIntent: Target intent classification enum.
        """
        clean_msg = self._normalize(message)

        # Tier 1: Check Product Inquiry Patterns
        for p in self.product_inquiry_patterns:
            if re.search(p, clean_msg):
                return MessageIntent.PRODUCT_INQUIRY

        # Tier 2: Check Bot Identity Patterns
        for p in self.identity_patterns:
            if re.search(p, clean_msg):
                return MessageIntent.CONVERSATION

        # Tier 3: Check Human Agent Escalation Patterns
        for p in self.human_escalation_patterns:
            if re.search(p, clean_msg):
                return MessageIntent.ESCALATION_REQUEST

        # Tier 4: Check Order Tracking & Delivery Status Patterns
        for p in self.order_issue_patterns:
            if re.search(p, clean_msg):
                return MessageIntent.ORDER_ISSUE

        # Tier 5: Check Dissatisfaction & Complaint Patterns
        for p in self.complaint_patterns:
            if re.search(p, clean_msg):
                return MessageIntent.COMPLAINT

        # Tier 6: Check FAQ Policy Patterns
        for p in self.policy_patterns:
            if re.search(p, clean_msg):
                return MessageIntent.POLICY

        # Tier 7: Reject Queries Requesting Out-of-Scope/Non-Fashion Items
        if any(phrase in clean_msg for phrase in ["do you sell", "can i buy", "can i get"]):
            words = set(re.findall(r"\b\w+\b", clean_msg))
            if words.intersection(self.off_topic_items):
                return MessageIntent.NORMAL

        # Tier 8: Semantic Embedding Search Fallback
        query_vec = list(self.encoder.embed([clean_msg]))[0]
        best_score = -1.0
        best_intent = MessageIntent.NORMAL

        for ref_vec, intent in self.vector_db:
            score = self._cosine_similarity(query_vec, ref_vec)
            if score > best_score:
                best_score = score
                best_intent = intent

        if best_score > 0.58:
            return best_intent

        return MessageIntent.NORMAL
