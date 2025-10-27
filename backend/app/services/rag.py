from typing import List, Dict, Any, Optional

import re
from app.core.config import settings
from qdrant_client import QdrantClient
from qdrant_client.models import  Filter, FieldCondition, MatchValue, MatchAny, Range
from app.sentence import get_embedding_from_hf


qclient = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
COLLECTION_NAME = settings.QDRANT_COLLECTION


async def hybrid_search(
    query: str,
    top_k: int = 5,
    sizes: Optional[List[str]] = None,
    colors: Optional[List[str]] = None,
    ages: Optional[List[str]] = None,
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
    q_vec = await get_embedding_from_hf(query)

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

    if ages:
        must_conditions.append(
            FieldCondition(
                key="meta.ages",
                match=MatchAny(any=ages)
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
