import asyncio
from google import genai
import json
from app.config import settings
from app.logger import logger

client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL_NAME = "text-embedding-004"

async def update_product_embeddings(ctx, product_id: str, text_to_embed: str) -> dict:
    logger.info(f"🧬 Starting vector calculation for Product: {product_id}")
    pool = ctx['db_pool']
    redis_client = ctx['redis']  # Fetch arq's running Redis connection instance
    
    # Clean product_id formatting for PostgreSQL numeric keys
    p_id = int(product_id) if isinstance(product_id, str) and product_id.isdigit() else product_id

    # 1. GENERATE EMBEDDINGS (Dev Mock vs Production Gemini)
    if settings.ENVIRONMENT == "development":
        logger.info("🛡️ [AI MOCK] Simulating local 768-dim vector array.")
        await asyncio.sleep(0.1)
        vector_values = [0.042] * 768
    else:
        try:
            loop = asyncio.get_running_loop()
            resp = await loop.run_in_executor(
                None,
                lambda: client.models.embed_content(model=MODEL_NAME, contents=text_to_embed)
            )
            vector_values = resp.embedding.values
        except Exception as e:
            logger.error(f"❌ Gemini Embeddings Pipeline failed: {str(e)}", exc_info=True)
            raise e

    # 2. SAVE EMBEDDING VECTOR TO PRISMA JSONB FIELD
    async with pool.acquire() as conn:
        # Pass the python list directly; asyncpg auto-encodes lists to json array text strings
        await conn.execute(
            "UPDATE products SET embedding = $1 WHERE id = $2",
            json.dumps(vector_values),
            p_id
        )
        logger.info(f"💾 Vector array successfully committed to JsonB column for product {p_id}")

        # 🚀 COMPUTE TOP 10 SIMILARITIES INSTANTLY VIA DATABASE
        # We parse the JsonB string array on the fly and compute Cosine Distance using a math string loop snippet
        # If your data pool is huge, we filter out self-matches using: p.id != target
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
        key = f"product:{p_id}:similar"
        
        # Use standard arq pipeline operations asynchronously
        async with redis_client.pipeline(transaction=True) as pipe:
            pipe.delete(key) # Clear out stale listings
            pipe.lpush(key, *reversed(top_10_ids))
            pipe.ltrim(key, 0, 9)
            pipe.expire(key, 60 * 60 * 24 * 30) # 30 day TTL expiration window
            await pipe.execute()
            
        logger.info(f"🔥 Successfully synced Redis cache key '{key}' with tracking entries: {top_10_ids}")

    return {"product_id": product_id, "status": "processed"}

