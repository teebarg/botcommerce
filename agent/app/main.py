from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from app.schemas.models import ChatRequest, ChatResponse, IngestRequest, HealthResponse
from app.agent.agent import run_agent
from app.agent.memory import clear_session
from app.config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on startup: pre-load the embedding model so the first request isn't slow.
    This is important for Render — cold starts can be slow without this.
    """
    logger.info("🚀 Pre-loading embedding model...")

    try:
        from app.rag.qdrant_client import get_embedding_model
        get_embedding_model()  # loads and caches the model
        logger.info("✅ Embedding model loaded")
    except Exception as e:
        logger.error(f"⚠️  Could not pre-load embedding model: {e}")

    yield

    logger.info("Shutting down...")


app = FastAPI(
    title="Customer Support Agent",
    description="AI-powered customer support using LangChain + RAG + Qdrant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Main chat endpoint.

    - Maintains conversation history per session_id
    - Automatically routes to RAG or API tools
    - Returns whether the conversation was escalated to a human
    """
    result = await run_agent(
        message=request.message,
        session_id=request.session_id,
        customer_id=request.customer_id,
    )
    return ChatResponse(**result)


@app.post("/ingest", tags=["Admin"])
async def ingest_data(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Trigger data ingestion into Qdrant.
    Runs in the background so it doesn't block the response.
    """
    from app.rag.ingest import ingest

    background_tasks.add_task(ingest, request.collection)

    return {
        "status": "started",
        "message": f"Ingesting '{request.collection}' in the background. Check server logs for progress.",
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health check endpoint. Render uses this to verify the service is running.
    Checks connectivity to Qdrant and Redis.
    """
    settings = get_settings()

    # Check Qdrant
    qdrant_status = "ok"
    try:
        from app.rag.qdrant_client import get_qdrant_client
        client = get_qdrant_client()
        client.get_collections()
    except Exception as e:
        qdrant_status = f"error: {str(e)[:50]}"

    # Check Redis
    redis_status = "ok"
    try:
        from app.agent.memory import get_redis
        r = get_redis()
        r.ping()
    except Exception as e:
        redis_status = f"error: {str(e)[:50]}"

    return HealthResponse(
        status="healthy",
        llm="groq",
        qdrant=qdrant_status,
        redis=redis_status,
        environment=settings.env,
    )


@app.delete("/session/{session_id}", tags=["Admin"])
async def delete_session(session_id: str):
    """Clear a session's conversation memory."""
    clear_session(session_id)
    return {"status": "cleared", "session_id": session_id}


@app.get("/", tags=["System"])
async def root():
    # TODO: Add more info
    return {
        "name": "Customer Support Agent",
        "status": "running",
        "docs": "/docs",
    }
