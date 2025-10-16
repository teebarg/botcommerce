from fastapi import FastAPI, HTTPException
from worker import process_pending_jobs, compute_similarity
from db import database
import logging
from contextlib import asynccontextmanager

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
