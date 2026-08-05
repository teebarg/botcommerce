import json
from app.services.image_enrichment import get_enrichment
from app.logger import logger

async def enrich_products(ctx) -> str:
    logger.info("⏰ [Automated Cron] Beginning 6-hour database catalog validation sweep...")
    pool = ctx['db_pool']
    redis = ctx['redis']
    try:
        async with pool.acquire() as conn:
            query = """
            SELECT
                p.id,
                p.sku,
                p.image,
                p.description,
                ARRAY_AGG(DISTINCT pi.image) FILTER (WHERE pi.image IS NOT NULL) AS img
            FROM products p
            LEFT JOIN product_images pi
                ON pi.product_id = p.id
            WHERE description IS NULL OR TRIM(description) = ''
            AND active IS TRUE
            GROUP BY p.id
            HAVING COUNT(pi.image) > 0
            LIMIT $1
          """
            products = await conn.fetch(query, 10)
            for p in products:
                logger.info(f"Enriching product: {p['id']}")
                images = p["img"]
                if not images:
                    continue
                try:
                    enrichment = await get_enrichment(img_url=p["img"][0], sku=p["sku"])
                    await conn.execute(
                        """
                    UPDATE products
                    SET name = $1, description = $2, features = $3, slug = $4
                    WHERE id = $5
                    """,
                        enrichment['title'],
                        enrichment['description'],
                        json.dumps(enrichment['features']),
                        enrichment['slug'],
                        p["id"]
                    )
                    text_for_embedding: str = f"Title: {enrichment['title']}. Description: {enrichment['description']}"
                    await redis.enqueue_job(
                        "update_product_embeddings",
                        product_id=str(p["id"]),
                        text_to_embed=text_for_embedding
                    )
                    logger.info(f"➡️ Enqueued embedding generation job for product: {p['id']}")
                except Exception as e:
                    raise Exception(e)
        logger.info("✅ [Automated Cron] Database sweep fully executed and synchronized.")
    except Exception as e:
        logger.error(f"Inventory synchronization failed: {str(e)}", exc_info=True)
        raise e
