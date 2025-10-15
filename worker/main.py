from fastapi import FastAPI
from worker import process_pending_jobs

app = FastAPI(title="AI Embedding Worker Service")

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI worker service running"}

@app.post("/process-jobs")
async def process_jobs():
    """
    Reads pending job IDs from Redis and computes embeddings
    for each product.
    """
    results = await process_pending_jobs()
    return {"processed": len(results), "details": results}
