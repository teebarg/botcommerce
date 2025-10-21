from typing import List, Dict, Any, Optional

# from sentence_transformers import SentenceTransformer
import hashlib
import re
from db import database
from config import settings
from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams, Distance, PointStruct, Filter,
    FieldCondition, MatchValue, MatchAny, Range
)
from tqdm import tqdm


qclient = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
# model = SentenceTransformer('all-MiniLM-L6-v2')
COLLECTION_NAME = settings.QDRANT_COLLECTION
BATCH_SIZE = 100


def string_to_numeric_id(string_id: str) -> int:
    """Convert string ID to numeric ID using hash."""
    return int(hashlib.md5(string_id.encode()).hexdigest()[:16], 16)


def safe_join(value):
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value) if value else ""


FETCH_SQLS = {
"products": """
 SELECT p.id, p.name, p.slug, p.description, array_to_string(p.features, ', ') AS features,
      string_agg(DISTINCT c.name, ', ') AS categories,
      string_agg(DISTINCT col.name, ', ') AS collections,
      string_agg(DISTINCT ('₦' || ROUND(pv.price::numeric, 2)::text), ', ') AS price,
      string_agg(DISTINCT pv."size", ', ') AS sizes,
      string_agg(DISTINCT pv."color", ', ') AS colors,
      MIN(pi.image) AS image
  FROM products p
  LEFT JOIN "_ProductCategories" pc ON p.id = pc."A"
  LEFT JOIN categories c ON pc."B" = c.id
  LEFT JOIN "_ProductCollections" pcl ON p.id = pcl."A"
  LEFT JOIN collections col ON pcl."B" = col.id
  JOIN product_variants pv ON p.id = pv.product_id
  JOIN product_images pi ON p.id = pi.product_id
  WHERE p.active = TRUE
  GROUP BY p.id
  LIMIT 1000;
""",
"categories": "SELECT id, name, slug FROM categories;",
"collections": "SELECT id, name, slug FROM collections;",
"faqs": "SELECT id, question, answer, category FROM faqs WHERE is_active = true;",
}

async def fetch_db() -> Dict[str, Any]:
  async with database.pool.acquire() as conn:
        data = {}
        for key, sql in FETCH_SQLS.items():
            rows = await conn.fetch(sql)
            data[key] = [dict(r) for r in rows]
        return data


async def build_corpus(raw_data: Dict[str, Any]) -> List[Dict]:
    corpus = []

    for p in raw_data.get("products", []):
        pid = f"product_{p['id']}"
        text_parts = []
        if p.get("name"): text_parts.append(p["name"])
        if p.get("description"): text_parts.append(p["description"])
        if p.get("features"): text_parts.append(f"Features: {safe_join(p['features'])}")
        if p.get("categories"): text_parts.append(f"Categories: {safe_join(p['categories'])}")
        if p.get("collections"): text_parts.append(f"Collections: {safe_join(p['collections'])}")
        if p.get("image"): text_parts.append(f"Image: {p['image']}")
        if p.get("price"): text_parts.append(f"Price: {p['price']}")
        if p.get("sizes"): text_parts.append(f"Available sizes: {safe_join(p['sizes'])}")
        if p.get("colors"): text_parts.append(f"Available colors: {safe_join(p['colors'])}")

        sizes_list = []
        if p.get("sizes"):
            if isinstance(p["sizes"], list):
                sizes_list = [str(s).strip() for s in p["sizes"]]
            else:
                sizes_list = [s.strip() for s in str(p["sizes"]).split(",")]
            text_parts.append(f"Available sizes: {', '.join(sizes_list)}")

        colors_list = []
        if p.get("colors"):
            if isinstance(p["colors"], list):
                colors_list = [str(c).strip().lower() for c in p["colors"]]
            else:
                colors_list = [c.strip().lower() for c in str(p["colors"]).split(",")]
            text_parts.append(f"Available colors: {', '.join(colors_list)}")

        price_numeric = None
        if p.get("price"):
            price_str = str(p["price"]).replace("₦", "").replace(",", "").strip()
            try:
                price_numeric = float(price_str)
            except ValueError:
                pass

        joined = " \n ".join(text_parts)
        corpus.append({
            "id": pid,
            "type": "product",
            "text": joined,
            "meta": {
                    "source": "products",
                    "product_id": p["id"],
                    "name": p.get("name"),
                    "slug": p.get("slug"),
                    "price": p.get("price"),
                    "price_numeric": price_numeric,
                    "sizes": sizes_list,
                    "colors": colors_list,
                    "image": p.get("image")
                }
        })

    for c in raw_data.get("categories", []):
        cid = f"category_{c['id']}"
        text = f"Category: {c.get('name')} (slug: {c.get('slug')})"
        corpus.append({"id": cid, "type": "category", "text": text, "meta": {"source": "categories", "category_id": c["id"], "name": c.get("name")}})

    for col in raw_data.get("collections", []):
        colid = f"collection_{col['id']}"
        text = f"Collection: {col.get('name')} (slug: {col.get('slug')})"
        corpus.append({"id": colid, "type": "collection", "text": text, "meta": {"source": "collections", "collection_id": col["id"], "name": col.get("name")}})

    for f in raw_data.get("faqs", []):
        fid = f"faq_{f['id']}"
        text = f"Q: {f.get('question')}\nA: {f.get('answer')}"
        corpus.append({"id": fid, "type": "faq", "text": text, "meta": {"source": "faqs", "faq_id": f["id"], "question": f.get("question")}})

    text += "\n- STANDARD: Regular delivery (typically 3-5 business days)\n"
    text += "- EXPRESS: Expedited delivery (typically 1-2 business days)\n"
    text += "- PICKUP: In-store pickup option (available same day if item is in stock)"
    corpus.append({"id": "delivery", "type": "delivery", "text": text})

    return corpus


async def index_corpus(corpus: List[Dict], model):
    """Index corpus into Qdrant with batch processing."""
    if not corpus:
        raise ValueError("Corpus is empty!")

    if qclient.collection_exists(COLLECTION_NAME):
        qclient.delete_collection(COLLECTION_NAME)

    qclient.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )

    qclient.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="meta.sizes",
        field_schema="keyword"
    )
    qclient.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="meta.colors",
        field_schema="keyword"
    )
    qclient.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="meta.price_numeric",
        field_schema="float"
    )
    qclient.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="type",
        field_schema="keyword"
    )

    texts = [d['text'] for d in corpus]
    print(f"Encoding {len(texts)} documents...")
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)

    points = []
    for d, emb in zip(corpus, embeddings):
        points.append(PointStruct(
            id=string_to_numeric_id(d['id']),
            vector=emb.tolist(),
            payload=d
        ))

    for i in tqdm(range(0, len(points), BATCH_SIZE), desc="Uploading to Qdrant"):
        batch = points[i:i + BATCH_SIZE]
        qclient.upsert(collection_name=COLLECTION_NAME, points=batch)

    print(f"✅ {len(points)} embeddings stored in Qdrant!")


async def hybrid_search(
    query: str,
    top_k: int = 5,
    sizes: Optional[List[str]] = None,
    colors: Optional[List[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    product_type: Optional[str] = None
) -> List[Dict]:
    """
    Hybrid search: Semantic vector search + exact attribute filtering.

    Args:
        query: Natural language search query
        top_k: Number of results to return
        sizes: List of exact sizes to filter (e.g., ["18", "20"])
        colors: List of colors to filter (e.g., ["red", "blue"])
        min_price: Minimum price filter
        max_price: Maximum price filter
        product_type: Filter by type (e.g., "product", "faq")

    Returns:
        List of search results with scores
    """
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    q_vec = model.encode(query).tolist()

    must_conditions = []

    if sizes:
        must_conditions.append(
            FieldCondition(
                key="meta.sizes",
                match=MatchAny(any=sizes)
            )
        )

    if colors:
        colors_lower = [c.lower() for c in colors]
        must_conditions.append(
            FieldCondition(
                key="meta.colors",
                match=MatchAny(any=colors_lower)
            )
        )

    if min_price is not None or max_price is not None:
        range_params = {}
        if min_price is not None:
            range_params['gte'] = min_price
        if max_price is not None:
            range_params['lte'] = max_price
        must_conditions.append(
            FieldCondition(
                key="meta.price_numeric",
                range=Range(**range_params)
            )
        )

    if product_type:
        must_conditions.append(
            FieldCondition(
                key="type",
                match=MatchValue(value=product_type)
            )
        )

    query_filter = Filter(must=must_conditions) if must_conditions else None

    hits = qclient.query_points(
        collection_name=COLLECTION_NAME,
        query=q_vec,
        limit=top_k,
        query_filter=query_filter
    )

    results = []
    for hit in hits.points:
        results.append({
            'id': hit.payload.get('id'),
            'text': hit.payload.get('text'),
            'score': hit.score,
            'type': hit.payload.get('type'),
            'meta': hit.payload.get('meta')
        })

    return results


async def parse_query(query: str) -> tuple[str, Dict[str, Any]]:
    """
    Extract structured filters from natural language query.
    Returns cleaned semantic query and extracted filters.
    """
    filters = {}
    cleaned_query = query.lower()

    # Extract sizes (e.g., "size 18", "sizes 12 and 14")
    size_patterns = [
        r'size[s]?\s+(\d+)(?:\s+and\s+(\d+))?(?:\s+and\s+(\d+))?',
        r'(\d+)\s+size[s]?'
    ]
    for pattern in size_patterns:
        match = re.search(pattern, cleaned_query)
        if match:
            sizes = [s for s in match.groups() if s]
            filters['sizes'] = sizes
            cleaned_query = re.sub(pattern, '', cleaned_query)
            break

    common_colors = ['red', 'blue', 'green', 'black', 'white', 'yellow',
                     'pink', 'purple', 'brown', 'orange', 'gray', 'grey']
    found_colors = []
    for color in common_colors:
        if color in cleaned_query:
            found_colors.append(color)
            cleaned_query = cleaned_query.replace(color, '')
    if found_colors:
        filters['colors'] = found_colors

    price_patterns = [
        (r'under\s+₦?(\d+(?:,\d+)*)', 'max_price'),
        (r'below\s+₦?(\d+(?:,\d+)*)', 'max_price'),
        (r'above\s+₦?(\d+(?:,\d+)*)', 'min_price'),
        (r'over\s+₦?(\d+(?:,\d+)*)', 'min_price'),
    ]
    for pattern, key in price_patterns:
        match = re.search(pattern, cleaned_query)
        if match:
            price = float(match.group(1).replace(',', ''))
            filters[key] = price
            cleaned_query = re.sub(pattern, '', cleaned_query)

    cleaned_query = re.sub(r'\s+', ' ', cleaned_query).strip()

    # If query is too short after filtering, use generic term
    if not cleaned_query or len(cleaned_query) < 2:
        cleaned_query = "product"

    return cleaned_query, filters

async def smart_search(query: str, top_k: int = 5) -> List[Dict]:
    """
    Intelligent search that automatically extracts filters from natural language.

    Example queries:
        - "Do you have size 18 products?"
        - "red luxury items under ₦5000"
        - "blue size 12 and 14 dresses"
    """
    semantic_query, filters = await parse_query(query)

    return await hybrid_search(semantic_query, top_k=top_k, **filters)


async def format_search_results_for_llm(results: List[Dict]) -> str:
    """
    Format search results into a structured context for the LLM.
    TODOO: Use XML/structured format for better parsing.
    """
    if not results:
        return "No relevant products found in the database."

    context_parts = ["PRODUCT CATALOG SEARCH RESULTS:\n"]

    for i, r in enumerate(results, 1):
        context_parts.append(f"\n--- Product {i} (Relevance Score: {r['score']:.2f}) ---")

        meta = r.get('meta', {})
        if meta is None:
                continue

        if meta.get('name'):
            context_parts.append(f"Name: {meta['name']}")

        if meta.get('slug'):
            context_parts.append(f"Slug: {meta['slug']}")

        if meta.get('price'):
            context_parts.append(f"Price: {meta['price']}")

        if meta.get('sizes'):
            sizes_str = ', '.join(meta['sizes']) if isinstance(meta['sizes'], list) else meta['sizes']
            context_parts.append(f"Available Sizes: {sizes_str}")

        if meta.get('colors'):
            colors_str = ', '.join(meta['colors']) if isinstance(meta['colors'], list) else meta['colors']
            context_parts.append(f"Available Colors: {colors_str}")

        if meta.get('image'):
            context_parts.append(f"Image: {meta['image']}")

        context_parts.append(f"\nFull Details:\n{r['text']}")
        context_parts.append("")

    return "\n".join(context_parts)
