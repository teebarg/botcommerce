import asyncio
from celery_app import celery_app
from services.image_enrichment import get_enrichment

@celery_app.task(name="tasks.enrich_products.run")
def enrich_products(limit: int = 10):
    asyncio.run(main(limit))


async def main(limit: int = 1):
    products = []
    async with database.pool.acquire() as conn:
        query = """
          SELECT p.id, p.image, ARRAY_AGG(DISTINCT pi.image) as img
          FROM products p
          LEFT JOIN product_images pi ON pi.product_id = p.id
          WHERE description IS NOT NULL AND description <> ''
          GROUP BY p.id
          LIMIT $1
        """
        products = await conn.fetch(query, limit)
        for p in products:
            images = p["img"]
            if not images:
                continue
            enrichment = get_enrichment(images[0])
            try:
              await conn.execute(
                  """
                  UPDATE products
                  SET name = $1, description = $2, features = $3
                  WHERE id = $4
                  """,
                  enrichment['title'],
                  enrichment['description'],
                  json.dumps(enrichment['features']),
                  p["id"]
              )
            except Exception as e:
              print(e)
