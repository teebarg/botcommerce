from fastapi import FastAPI, HTTPException
from worker import compute_similarity
from starlette.middleware.cors import CORSMiddleware
from db import database
import logging
from contextlib import asynccontextmanager
from config import settings
from tasks.enrich_products import enrich_products

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

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
async def root():
    return {"status": "ok", "message": "AI worker service running"}


@app.post("/compute-similar")
async def compute_products_similarity():
    """
    Computes similarity for each product.
    """
    try:
        await compute_similarity()
        return {"status": "ok", "message": "Similarity computed successfully"}
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))

@app.post("/products/enrich")
def start_enrichment(limit: int = 10):
    enrich_products.delay(limit)
    return {"status": "queued", "msg": f"Enrichment started for {limit} products"}
