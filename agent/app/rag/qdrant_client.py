from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter,
    FieldCondition, MatchValue
)
# from sentence_transformers import SentenceTransformer
from functools import lru_cache
from typing import Optional
import uuid
import logging
from pathlib import Path
from fastembed import TextEmbedding
import os

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# MODEL_NAME = "all-MiniLM-L6-v2"
# MODEL_CACHE_DIR = "/agent/models"
MODEL_CACHE_DIR = "/app/agent/models"

BASE_DIR = Path(__file__).resolve().parent.parent.parent
LOCAL_MODEL_DIR = BASE_DIR / "models" / MODEL_NAME

BASE_DIR = Path(__file__).resolve().parent.parent # Points to 'agent' folder
LOCAL_MODELS = str(BASE_DIR / "models")

MODEL_CACHE_DIR = os.environ.get("FASTEMBED_CACHE_PATH", LOCAL_MODELS)

# @lru_cache()
# def get_embedding_model2() -> SentenceTransformer:
#     if LOCAL_MODEL_DIR.exists():
#         print(f"Loading embedding model from local path: {LOCAL_MODEL_DIR}")
#         return SentenceTransformer(str(LOCAL_MODEL_DIR))
#     else:
#         print("Model not found locally. Downloading and saving to disk...")
#         model = SentenceTransformer(MODEL_NAME)
#         LOCAL_MODEL_DIR.parent.mkdir(parents=True, exist_ok=True)
#         model.save(str(LOCAL_MODEL_DIR))
#         return model


EMBEDDING_DIM = 384  # dimension for all-MiniLM-L6-v2

COLLECTIONS = {
    "products": "shop_products",
    "faqs": "shop_faqs",
    "policies": "shop_policies",
}

@lru_cache()
def get_embedding_model() -> TextEmbedding:
    logger.info(f"Loading FastEmbed model: {MODEL_NAME} (ONNX, no PyTorch)")
    return TextEmbedding(
        model_name=MODEL_NAME,
        cache_dir=MODEL_CACHE_DIR,
        local_files_only=True,
    )

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
    # embeddings = model.encode(texts, show_progress_bar=True).tolist()
    embeddings = list(model.embed(texts))

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            # vector=embedding,
            vector=embedding.tolist(),
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

    # query_vector = model.encode(query).tolist()
    query_vector = list(model.embed([query]))[0].tolist()

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
