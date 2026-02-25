"""
Run whenever your products, FAQs, or policies change:
  uv run python -m app.rag.ingest --collection all
  uv run python -m app.rag.ingest --collection products
  uv run python -m app.rag.ingest --collection faqs
  uv run python -m app.rag.ingest --collection policies
"""

import asyncio
import argparse
import logging
import asyncpg
from app.rag.qdrant_client import upsert_documents
from app.config import get_settings

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def get_connection() -> asyncpg.Connection:
    url: str | None = settings.DATABASE_URL
    if not url:
        raise RuntimeError("DATABASE_URL is not set in .env")
    return await asyncpg.connect(url)

async def load_products(conn: asyncpg.Connection) -> list[dict]:
    """
    Load active products with their variants, and categories.
    One query with JOINs — no ORM overhead.
    """
    rows = await conn.fetch("""
        SELECT
            p.id,
            p.name,
            p.sku,
            p.description,
            p.is_new,
            STRING_AGG(DISTINCT c.name, ', ')           AS categories,
            MIN(pv.price)                               AS min_price,
            MAX(pv.price)                               AS max_price,
            MIN(pv.old_price)                           AS old_price,
            STRING_AGG(DISTINCT pv.size, ', ')          AS sizes,
            STRING_AGG(DISTINCT pv.color, ', ')         AS colors,
            COUNT(pv.id)                                AS total_variants,
            COUNT(pv.id) FILTER (
                WHERE pv.status = 'IN_STOCK'
            )                                           AS in_stock_variants
        FROM products p
        LEFT JOIN "_ProductCategories" pc ON pc."A" = p.id
        LEFT JOIN categories c       ON c.id = pc."B"
        LEFT JOIN product_variants pv ON pv.product_id = p.id
        WHERE p.active = true
        GROUP BY p.id, p.name, p.sku, p.description, p.is_new
        ORDER BY p.id
    """)

    documents = []
    for r in rows:
        price = ""
        if r["min_price"] is not None:
            if r["min_price"] == r["max_price"]:
                price: str = f"₦{r['min_price']:.2f}"
            else:
                price: str = f"₦{r['min_price']:.2f} – ₦{r['max_price']:.2f}"

        variants_summary: str = " | ".join(filter(None, [
            f"Sizes: {r['sizes']}"          if r["sizes"]  else None,
            f"Colors: {r['colors']}"        if r["colors"] else None,
            f"Price: {price}"         if price else None,
            f"{r['in_stock_variants']}/{r['total_variants']} variants in stock"
                                            if r["total_variants"] else None,
        ]))

        text: str = " ".join(filter(None, [
            f"Product: {r['name']}.",
            f"Category: {r['categories']}." if r["categories"] else None,
            f"Description: {r['description']}." if r["description"] else None,
            f"SKU: {r['sku']}.",
            "Is New."                  if r["is_new"]     else "Thrift",
            variants_summary,
        ]))

        documents.append({
            "text": text,
            "product_id": r["id"],
            "name": r["name"],
            "sku": r["sku"],
            "description": r["description"] or "",
            "category": r["categories"] or "",
            "is_new": r["is_new"],
            "variants_summary": variants_summary,
            "price": price,
            "type": "product",
        })

    logger.info(f"Loaded {len(documents)} active products")
    return documents


async def load_faqs(conn: asyncpg.Connection) -> list[dict]:
    """Load active FAQs from the faqs table."""
    rows = await conn.fetch("""
        SELECT id, question, answer, category
        FROM faqs
        WHERE is_active = true
        ORDER BY id
    """)

    documents = []
    for r in rows:
        documents.append({
            "text": f"Q: {r['question']} A: {r['answer']}",
            "faq_id": r["id"],
            "question": r["question"],
            "answer": r["answer"],
            "category": r["category"] or "General",
            "type": "faq",
        })

    logger.info(f"Loaded {len(documents)} active FAQs")
    return documents


async def load_policies(conn: asyncpg.Connection) -> list[dict]:
    """
    Load shipping/delivery options and relevant shop settings as policy docs.
    """
    documents = []

    # Delivery options → shipping policy facts
    delivery_rows = await conn.fetch("""
        SELECT id, name, method, amount, duration, description
        FROM delivery_options
        WHERE is_active = true
        ORDER BY id
    """)

    for r in delivery_rows:
        text = " ".join(filter(None, [
            f"Shipping option: {r['name']}.",
            f"Method: {r['method']}.",
            f"Cost: ${r['amount']:.2f}.",
            f"Estimated duration: {r['duration']}." if r["duration"] else None,
            r["description"] if r["description"] else None,
        ]))
        documents.append({
            "text": text,
            "delivery_option_id": r["id"],
            "method": r["method"],
            "name": r["name"],
            "amount": r["amount"],
            "duration": r["duration"],
            "type": "policy",
            "policy_type": "shipping",
        })

    # Shop settings — only ones with meaningful text content
    settings_rows = await conn.fetch("""
        SELECT key, value
        FROM shop_settings
        WHERE type IN ('SHOP_DETAIL', 'FEATURE')
          AND value IS NOT NULL
          AND LENGTH(value) > 20
        ORDER BY key
    """)

    for r in settings_rows:
        documents.append({
            "text": f"{r['key']}: {r['value']}",
            "key": r["key"],
            "value": r["value"],
            "type": "policy",
            "policy_type": "shop_setting",
        })

    logger.info(f"Loaded {len(documents)} policy documents")
    return documents

LOADERS = {
    "products": load_products,
    "faqs":     load_faqs,
    "policies": load_policies,
}


async def ingest(collection: str) -> None:
    conn = await get_connection()
    try:
        targets: list[str] = list(LOADERS.keys()) if collection == "all" else [collection]
        for name in targets:
            logger.info(f"\n{'='*40}\nIngesting: {name}\n{'='*40}")
            docs = await LOADERS[name](conn)
            if not docs:
                logger.warning(f"No documents found for '{name}' — skipping.")
                continue
            count: int = upsert_documents(name, docs)
            logger.info(f"✅ {name}: {count} documents upserted into Qdrant")
    finally:
        await conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--collection",
        default="all",
        choices=["all", "products", "faqs", "policies"],
    )
    args = parser.parse_args()

    asyncio.run(ingest(args.collection))
