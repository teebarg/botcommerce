from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter,
    FieldCondition, MatchValue
)
from sentence_transformers import SentenceTransformer
from functools import lru_cache
from typing import Optional
import uuid
import logging

logger = logging.getLogger(__name__)

# ── Embedding model ──────────────────────────────────────────────────────────
# all-MiniLM-L6-v2: ~90MB, fast, great quality for semantic search
# Cached so it only loads once
@lru_cache()
def get_embedding_model() -> SentenceTransformer:
    logger.info("Loading embedding model: all-MiniLM-L6-v2 (~90MB, one-time load)")
    return SentenceTransformer("all-MiniLM-L6-v2")


EMBEDDING_DIM = 384  # dimension for all-MiniLM-L6-v2

COLLECTIONS = {
    "products": "shop_products",
    "faqs": "shop_faqs",
    "policies": "shop_policies",
}


@lru_cache()
def get_qdrant_client() -> QdrantClient:
    from app.config import get_settings
    settings = get_settings()
    logger.info(f"Connecting to Qdrant: {settings.qdrant_url}")
    return QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
    )


def ensure_collection(collection_name: str) -> None:
    """Create collection if it doesn't exist."""
    client = get_qdrant_client()
    existing = [c.name for c in client.get_collections().collections]

    if collection_name not in existing:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )
        logger.info(f"Created Qdrant collection: {collection_name}")
    else:
        logger.info(f"Collection already exists: {collection_name}")


def upsert_documents(collection_key: str, documents: list[dict]) -> int:
    """
    Embed and upsert documents into Qdrant.

    Each document must have:
      - 'text': str  → text to embed
      - any other fields → stored as payload (retrievable at search time)

    Returns number of documents upserted.
    """
    collection_name: str = COLLECTIONS[collection_key]
    ensure_collection(collection_name)

    model = get_embedding_model()
    client = get_qdrant_client()

    texts = [doc["text"] for doc in documents]
    embeddings = model.encode(texts, show_progress_bar=True).tolist()

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload=doc,  # full doc stored as payload
        )
        for doc, embedding in zip(documents, embeddings)
    ]

    client.upsert(collection_name=collection_name, points=points)
    logger.info(f"Upserted {len(points)} docs into '{collection_name}'")
    return len(points)


def search_collection(
    collection_key: str,
    query: str,
    top_k: int = 3,
    score_threshold: float = 0.5,
    filters: Optional[dict] = None,
) -> list[dict]:
    """
    Semantic search over a collection.
    Returns list of payload dicts from matching documents.
    score_threshold: ignore results below this cosine similarity (0-1).
    """
    collection_name: str = COLLECTIONS[collection_key]
    model = get_embedding_model()
    client = get_qdrant_client()

    query_vector = model.encode(query).tolist()

    # Build optional filter (e.g. filter by category)
    qdrant_filter = None
    if filters:
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filters.items()
        ]
        qdrant_filter = Filter(must=conditions)

    results = client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=top_k,
        score_threshold=score_threshold,
        query_filter=qdrant_filter,
        with_payload=True,
    )

    return [
        {**hit.payload, "_score": round(hit.score, 3)}
        for hit in results
    ]
