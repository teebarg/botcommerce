import asyncio
import asyncpg
from google import genai
from google.genai import types
import json
from app.config import settings
from app.logger import logger

client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL_NAME = "gemini-embedding-2"
EMBEDDING_DIMENSIONS = 768

async def update_product_embeddings(ctx, product_id: str, text_to_embed: str) -> dict:
    if not settings.EMBEDDINGS_ENABLED:
        logger.warning(f"⚠️ [FEATURE DISABLED] Skipping vector calculations for product {product_id}.")
        return {"status": "skipped_feature_disabled"}

    logger.info(f"🧬 Starting vector calculation for Product: {product_id}")
    pool = ctx['db_pool']
    redis = ctx['redis']

    p_id = int(product_id) if isinstance(product_id, str) and product_id.isdigit() else product_id

    if settings.ENVIRONMENT == "development":
        logger.info("🛡️ [AI MOCK] Simulating local 768-dim vector array.")
        await asyncio.sleep(0.1)
        vector_values = [0.042] * 768
    else:
        try:
            loop = asyncio.get_running_loop()
            resp = await loop.run_in_executor(
                None,
                lambda: client.models.embed_content(
                    model=MODEL_NAME,
                    contents=text_to_embed,
                    config=types.EmbedContentConfig(
                        output_dimensionality=EMBEDDING_DIMENSIONS,
                    ),
                )
            )

            vector_values = resp.embeddings[0].values
        except Exception as e:
            logger.error(f"❌ Gemini Embeddings Pipeline failed: {str(e)}", exc_info=True)
            raise e

    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE products SET embedding = $1 WHERE id = $2",
            json.dumps(vector_values),
            p_id
        )
        logger.info(f"💾 Vector array successfully committed to JsonB column for product {p_id}")

        # We parse the JsonB string array on the fly and compute Cosine Distance using a math string loop snippet
        similarity_query = """
            WITH target_vector AS (
                SELECT embedding FROM products WHERE id = $1
            )
            SELECT
                p.id,
                (
                    SELECT
                        (SELECT SUM(a.val * b.val) FROM UNNEST(ARRAY(SELECT jsonb_array_elements_text(p.embedding)::float)) WITH ORDINALITY AS a(val, idx) JOIN UNNEST(ARRAY(SELECT jsonb_array_elements_text(t.embedding)::float)) WITH ORDINALITY AS b(val, idx) ON a.idx = b.idx)
                        /
                        (
                            SQRT((SELECT SUM(val*val) FROM UNNEST(ARRAY(SELECT jsonb_array_elements_text(p.embedding)::float)) AS val))
                            *
                            SQRT((SELECT SUM(val*val) FROM UNNEST(ARRAY(SELECT jsonb_array_elements_text(t.embedding)::float)) AS val))
                        )
                    FROM target_vector t
                ) as similarity
            FROM products p
            WHERE p.embedding IS NOT NULL AND p.id != $1
            ORDER BY similarity DESC
            LIMIT 10;
        """

        logger.info(f"🎯 Calculating top 10 neighbors using native database vector layers...")
        top_neighbors = await conn.fetch(similarity_query, p_id)
        top_10_ids = [str(row["id"]) for row in top_neighbors]

    if top_10_ids:
        key: str = f"product:{p_id}:similar"

        # Use standard arq pipeline operations asynchronously
        async with redis.pipeline(transaction=True) as pipe:
            pipe.delete(key) # Clear out stale listings
            pipe.lpush(key, *reversed(top_10_ids))
            pipe.ltrim(key, 0, 9)
            pipe.expire(key, 60 * 60 * 24 * 30) # 30 day TTL expiration window
            await pipe.execute()

        logger.info(f"🔥 Successfully synced Redis cache key '{key}' with tracking entries: {top_10_ids}")

    return {"product_id": product_id, "status": "processed"}


BATCH_SIZE = 200

# Products with no images AND never referenced by an order or cart item
FIND_HARD_DELETE_CANDIDATES = """
    SELECT p.id
    FROM products p
    WHERE NOT EXISTS (
        SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM product_variants pv
        JOIN order_items oi ON oi.variant_id = pv.id
        WHERE pv.product_id = p.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM product_variants pv
        JOIN cart_items ci ON ci.variant_id = pv.id
        WHERE pv.product_id = p.id
    )
    ORDER BY p.id
"""

# Products with no images but WITH order/cart history — deactivate, don't delete
FIND_DEACTIVATE_CANDIDATES = """
    SELECT p.id
    FROM products p
    WHERE p.active = true
    AND NOT EXISTS (
        SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
    )
    AND (
        EXISTS (
            SELECT 1 FROM product_variants pv
            JOIN order_items oi ON oi.variant_id = pv.id
            WHERE pv.product_id = p.id
        )
        OR EXISTS (
            SELECT 1 FROM product_variants pv
            JOIN cart_items ci ON ci.variant_id = pv.id
            WHERE pv.product_id = p.id
        )
    )
    ORDER BY p.id
"""

async def clean_up_dangling(ctx, dry_run: bool = False) -> dict:
    """
    - Hard-deletes imageless products with zero order/cart history.
    - Deactivates (active=False) imageless products that DO have order/cart
      history, instead of deleting — preserves audit trail and never touches
      an active cart.
    """
    pool: asyncpg.Pool = ctx["db_pool"]
    logger.info("[clean_up_dangling] starting sweep for imageless products")

    async with pool.acquire() as conn:
        delete_ids = [r["id"] for r in await conn.fetch(FIND_HARD_DELETE_CANDIDATES)]
        deactivate_ids = [r["id"] for r in await conn.fetch(FIND_DEACTIVATE_CANDIDATES)]

    logger.info(
        f"[clean_up_dangling] candidates — "
        f"delete={len(delete_ids)} deactivate={len(deactivate_ids)}"
    )

    deleted, failed_delete = [], []
    deactivated, failed_deactivate = [], []

    if not dry_run:
        for i in range(0, len(delete_ids), BATCH_SIZE):
            batch = delete_ids[i : i + BATCH_SIZE]
            async with pool.acquire() as conn:
                try:
                    async with conn.transaction():
                        await conn.execute(
                            "DELETE FROM products WHERE id = ANY($1::int[])", batch
                        )
                    deleted.extend(batch)
                except Exception as e:
                    failed_delete.extend(batch)
                    logger.error(f"[clean_up_dangling] batch delete failed: {e}")

        for i in range(0, len(deactivate_ids), BATCH_SIZE):
            batch = deactivate_ids[i : i + BATCH_SIZE]
            async with pool.acquire() as conn:
                try:
                    await conn.execute(
                        "UPDATE products SET active = false WHERE id = ANY($1::int[])",
                        batch,
                    )
                    deactivated.extend(batch)
                except Exception as e:
                    failed_deactivate.extend(batch)
                    logger.error(f"[clean_up_dangling] batch deactivate failed: {e}")
    else:
        deleted, deactivated = delete_ids, deactivate_ids

    logger.info(
        f"[clean_up_dangling] done — deleted={len(deleted)} "
        f"deactivated={len(deactivated)} failed_delete={len(failed_delete)} "
        f"failed_deactivate={len(failed_deactivate)}"
    )

    return {
        "dry_run": dry_run,
        "deleted_count": len(deleted),
        "deactivated_count": len(deactivated),
        "failed_delete_count": len(failed_delete),
        "failed_deactivate_count": len(failed_deactivate),
        "deleted_ids": deleted,
        "deactivated_ids": deactivated,
    }
