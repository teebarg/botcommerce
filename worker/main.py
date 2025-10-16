from fastapi import FastAPI, HTTPException, Request
from worker import process_pending_jobs, compute_similarity, generate_description
from db import database
import logging
from contextlib import asynccontextmanager
import asyncio
from typing import List
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀connecting to dbs......:")
    await database.connect()
    logger.info("✅ ~ connected to pyscopg......:")
    yield
    await database.disconnect()

app = FastAPI(title="AI Embedding Worker Service", lifespan=lifespan)

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI worker service running"}

@app.post("/process-jobs")
async def process_jobs():
    """
    Computes embeddings for each product.
    """
    try:
        results = await process_pending_jobs()
        return {"processed": len(results), "details": results}
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))

@app.post("/compute-similar")
async def compute_similar():
    """
    Computes similarity for each product.
    """
    try:
        await compute_similarity()
        return {"status": "ok", "message": "Similarity computed successfully"}
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))


@app.post("/generate-missing-descriptions")
async def generate_missing_descriptions(request: Request):
    pool = database.pool
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY")

    async with pool.acquire() as conn:
        records = await conn.fetch(
            """
            SELECT
                p.id,
                p.name,
                c.name AS category_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', v.id,
                            'size', v.size,
                            'color', v.color,
                            'measurement', v.measurement
                        )
                    ) FILTER (WHERE v.id IS NOT NULL),
                    '[]'
                ) AS variants
            FROM products p
            LEFT JOIN "_ProductCategories" pc ON p.id = pc."A"
            LEFT JOIN categories c ON pc."B" = c.id
            LEFT JOIN product_variants v ON p.id = v.product_id
            WHERE p.description IS NULL OR p.description = ''
            GROUP BY p.id, c.name
            LIMIT 5;
            """
        )

        if not records:
            return {"message": "✅ No products missing descriptions."}

        tasks = [generate_description(dict(r)) for r in records]
        descriptions: List[str] = await asyncio.gather(*tasks)

        updates = [
            {"id": r["id"], "desc": desc}
            for r, desc in zip(records, descriptions)
            if desc
        ]

        async with conn.transaction():
            for item in updates:
                await conn.execute(
                    "UPDATE products SET description = $1 WHERE id = $2",
                    item["desc"],
                    item["id"],
                )

    return {
        "updated": len(updates),
        "product_ids": [u["id"] for u in updates],
    }
