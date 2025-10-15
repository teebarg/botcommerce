import os
import redis
# import requests
import asyncio
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
PRODUCT_API_BASE = os.getenv("PRODUCT_API_BASE")
API_KEY = os.getenv("API_KEY")

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
model = SentenceTransformer("all-MiniLM-L6-v2")

QUEUE_NAME = "PRODUCT_EMBED_JOBS"

async def process_pending_jobs():
    processed = []

    while True:
        job = r.lpop(QUEUE_NAME)
        if not job:
            break  # No more jobs

        product_id = str(job)
        print(f"Processing product {product_id}")

        try:
            async with database.pool.acquire() as conn:
                products_query = """
                    SELECT p.id, p.name, p.description,
                        ARRAY_AGG(DISTINCT c.name) as categories
                    FROM products p
                    LEFT JOIN "_ProductCategories" pc ON p.id = pc."A"
                    LEFT JOIN categories c ON pc."B" = c.id
                    GROUP BY p.id, p.name
                """
                products = await conn.fetch(products_query)
                for p in products:
                    text = f"{p.get('name', '')} {p.get('description', '')} {''.join(c for c in p.get('categories', []) if c)}"
                    embedding = model.encode(text).tolist()

                    await conn.execute(
                        """
                        UPDATE products
                        SET embedding = $1
                        WHERE id = $2
                        """,
                        json.dumps(embedding),
                        p["id"]
                    )
                    print("..")
                    print("All products updated successfully")
        except Exception as e:
            print(f"❌ Failed to fetch product {product_id}: {e}")
            continue

    return processed
