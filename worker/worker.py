from sentence_transformers import SentenceTransformer
import json
import numpy as np
from redis_client import redis_client as r
from db import database

model = SentenceTransformer("all-MiniLM-L6-v2")


def cosine_similarity(vec_a, vec_b):
    if isinstance(vec_a, str):
        vec_a = json.loads(vec_a)
    if isinstance(vec_b, str):
        vec_b = json.loads(vec_b)
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


async def process_pending_jobs():
    processed = []
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
                processed.append(p["id"])
            print("All products updated successfully")
    except Exception as e:
        print(f"❌ Failed to fetch products: {e}")
        raise Exception(f"Failed to fetch products: {e}")

    return processed


async def compute_similarity():
    products = []
    async with database.pool.acquire() as conn:
        products = await conn.fetch("SELECT id, embedding FROM products WHERE embedding IS NOT NULL")

    print("pushing products id to redis")
    for product in products:
        base = json.loads(product["embedding"]) if isinstance(product["embedding"], str) else product["embedding"]
        similarities = []

        for other in products:
            if other["id"] == product["id"]:
                continue
            vec = json.loads(other["embedding"]) if isinstance(other["embedding"], str) else other["embedding"]
            a, b = np.array(base, dtype=float), np.array(vec, dtype=float)
            sim = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
            similarities.append((other["id"], sim))

        top_10 = [str(pid) for pid, _ in sorted(similarities, key=lambda x: x[1], reverse=True)[:10]]
        key = f"product:{product['id']}:similar"
        if top_10:
            async with r.pipeline(transaction=True) as pipe:
                pipe.lpush(key, *reversed(top_10))
                pipe.ltrim(key, 0, 9)
                pipe.expire(key, 60 * 60 * 24 * 30)
                await pipe.execute()
