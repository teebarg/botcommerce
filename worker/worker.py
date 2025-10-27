import json
import numpy as np
from redis_client import redis_client as r
from db import database
from config import settings


def cosine_similarity(vec_a, vec_b):
    if isinstance(vec_a, str):
        vec_a = json.loads(vec_a)
    if isinstance(vec_b, str):
        vec_b = json.loads(vec_b)
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


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


def parse_variants(value):
    import json
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return []
    return value


async def generate_description(product: dict) -> str:
    """Generate SEO-optimized product description with variant + category info."""
    variants = parse_variants(product.get("variants"))

    variants_text = ", ".join(
        [
            f"Size: {v.get('size', '-')}, Color: {v.get('color', '-')}, Measurement: {v.get('measurement', '-')}, Age: {v.get('age', '-')}"
            for v in variants
        ]
    ) or "No variant information available."

    prompt = f"""
    Write a short, engaging, and complete marketing product description for the following product.
    Do not use placeholders, brackets, or markdown syntax. Use natural language only.

    Product name: {product.get('name')}
    Category: {product.get('category_name', '')}
    Available variants: {variants_text}
    Highlight features, use cases, and appeal to the target audience in under 80 words.
    """

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return response.text
