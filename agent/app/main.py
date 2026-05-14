import dataclasses
from app.logging import get_logger
from app.agent.eval_config import SUPPORT_EVAL_CONFIG
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# import logging
# import sys

from app.schemas.models import ChatRequest, ChatResponse, IngestRequest, HealthResponse
from app.agent.agent_graph import run_agent
from app.agent.memory import clear_session
from app.config import get_model_name, get_settings
from app.utils import _notify_slack_escalation
from app.agent.db import is_human_connected, save_message_db, mark_escalated, ensure_conversation_exists
from app.redis_client import redis_client
from app.agent.memory import save_messages_to_redis, load_messages_from_redis
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
import time
from app.observability.tracing import start_turn_trace, end_turn_trace
from app.observability.eval_runner import run_eval_pipeline
from app.observability.langfuse_client import flush_langfuse
from app.config import get_llm

# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
#     handlers=[logging.StreamHandler(sys.stdout)],
# )
# logger = logging.getLogger(__name__)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on startup: pre-load the embedding model so the first request isn't slow.
    """
    logger.debug("🚀 Pre-loading embedding model...")

    try:
        from app.rag.qdrant_client import get_embedding_model
        get_embedding_model()  # loads and caches the model
        logger.debug("✅ Embedding model loaded")
    except Exception as e:
        logger.error(f"⚠️  Could not pre-load embedding model....: {e}")

    yield
    flush_langfuse()

    logger.debug("Shutting down...")


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

async def persist_turn_to_db(session_id: str, user_msg: str, ai_msg: str, user_metadata: dict, ai_metadata: dict) -> None:
    """Saves both messages using the UPSERT-safe function."""
    try:
        await save_message_db(session_id=session_id, role="USER", content=user_msg, metadata=user_metadata)
        await save_message_db(session_id=session_id, role="BOT", content=ai_msg, metadata=ai_metadata)
        logger.debug(f"💾 Persisted turn for session {session_id} to DB")
    except Exception as e:
        logger.error(f"❌ Background DB Persistence Error: {e}")


@app.post("/chat", tags=["Chat"])
async def chat(request: Request, payload: ChatRequest, background_tasks: BackgroundTasks) -> ChatResponse:
    """
    Main chat endpoint.

    - Maintains conversation history per session_id
    - Automatically routes to RAG or API tools
    - Returns whether the conversation was escalated to a human
    """
    logger.debug("Starting agent chat...................................................................................")
    connection_key = payload.customer_id or payload.app_session_id
    await redis_client.set(f"chat_user:{payload.session_id}", str(connection_key))

    if payload.customer_id is None:
        await redis_client.set(f"chat_session:{connection_key}", payload.session_id)

    await ensure_conversation_exists(conversation_uuid=payload.session_id, customer_id=payload.customer_id)

    if payload.type == "form_submission":
        if payload.form_type == "escalation_details":
            reason: str = (
                f"Escalation request:\n"
                f"Name: {payload.data.get('name')}\n"
                f"Category: {payload.data.get('phone')}\n"
                f"Summary: {payload.data.get('summary')}\n"
                f"Order Number: {payload.data.get('order_number')}"
            )

            await _notify_slack_escalation(
                session_id=payload.session_id,
                customer_id=payload.customer_id,
                reason=reason,
            )

            await mark_escalated(conversation_uuid=payload.session_id)

            user_msg = "User provided response"
            reply="Thank you. A human support agent will contact you shortly."

            background_tasks.add_task(
                persist_turn_to_db,
                session_id=payload.session_id,
                user_msg=user_msg,
                ai_msg=reply,
                ai_metadata={"escalated": True},
                user_metadata={"reason": reason}
            )

            return ChatResponse(
                reply=reply,
                session_id=payload.session_id,
                escalated=True,
            )

        if payload.form_type == "complaint_details":
            reason: str = (
                f"Complaint request:\n"
                f"Name: {payload.data.get('name')}\n"
                f"Email: {payload.data.get('email')}\n"
                f"Category: {payload.data.get('phone')}\n"
                f"Description: {payload.data.get('description')}\n"
                f"Order Number: {payload.data.get('order_number')}"
            )

            await _notify_slack_escalation(
                session_id=payload.session_id,
                customer_id=payload.customer_id,
                reason=reason,
            )

            user_msg = "User provided response"
            reply=(
                "Thanks, I've sent your request to our support team. "
                "They’ll get back to you within 24 hours. "
                "If you'd like, I can still help with anything else in the meantime."
            )

            history: list[BaseMessage] = load_messages_from_redis(payload.session_id)
            save_messages_to_redis(
                session_id=payload.session_id,
                messages=history + [HumanMessage(content=user_msg), AIMessage(content="Complaint request received and sent to support team")],
            )

            background_tasks.add_task(
                persist_turn_to_db,
                session_id=payload.session_id,
                user_msg=user_msg,
                ai_msg=reply,
                ai_metadata={"complaint_sent": True},
                user_metadata={"reason": reason}
            )

            return ChatResponse(
                reply=reply,
                session_id=payload.session_id,
                complaint_sent=True,
            )

    if await is_human_connected(payload.session_id):
        await save_message_db(session_id=payload.session_id, content=payload.message or "", role="USER")
        return ChatResponse(
            reply="You're connected with a support agent. They'll respond shortly.",
            session_id=payload.session_id,
            sources=[],
            products=[],
            escalated=False,
            quick_replies=[],
            form=None,
        )

    _t_start = time.monotonic()
    trace, turn_span = start_turn_trace(
        session_id=payload.session_id,
        customer_id=payload.customer_id,
        message=payload.message or "",
    )

    try:
        result = await run_agent(
            message=payload.message or "",
            session_id=payload.session_id,
            customer_id=payload.customer_id,
        )
    except Exception:
        return ChatResponse(reply="Something went wrong on my end. Please try again.", session_id=payload.session_id)


    _latency_ms = (time.monotonic() - _t_start) * 1000

    trace.update(metadata={
        "latency_ms": round(_latency_ms, 1),
        "iterations": result.get("_iterations", 0),
        "intent": result.get("_intent", "normal"),
        "had_tools": bool(result.get("_tools_called")),
    })

    end_turn_trace(
        span=turn_span,
        trace=trace,
        reply=result.get("reply", ""),
        escalated=result.get("escalated", False),
        sources=result.get("sources", []),
        latency_ms=_latency_ms,
    )

    background_tasks.add_task(
        persist_turn_to_db,
        session_id=payload.session_id,
        user_msg=payload.message or "",
        ai_msg=result.get("reply", ""),
        ai_metadata={
            "sources": result.get("sources"),
            "products": result.get("products"),
            "escalated": result.get("escalated"),
            "complaint_sent": result.get("complaint_sent"),
            "quick_replies": result.get("quick_replies"),
            "form": result.get("form"),
        },
        user_metadata={}
    )

    background_tasks.add_task(
        run_eval_pipeline,
        session_id=payload.session_id,
        customer_id=payload.customer_id,
        langfuse_trace_id=trace.id,
        user_message=payload.message or "",
        agent_reply=result.get("reply", ""),
        escalated=result.get("escalated", False),
        sources=result.get("sources", []),
        tools_called=result.get("_tools_called", []),
        latency_ms=_latency_ms,
        prompt_tokens=result.get("_prompt_tokens", 0),
        completion_tokens=result.get("_completion_tokens", 0),
        llm=get_llm(),
        config=dataclasses.replace(SUPPORT_EVAL_CONFIG, model_name=get_model_name()),
        error=None,
        stacktrace=None,
    )

    return ChatResponse(**result)


@app.post("/ingest", tags=["Admin"])
async def ingest_data(payload: IngestRequest, background_tasks: BackgroundTasks):
    """
    Trigger data ingestion into Qdrant.
    """
    from app.rag.ingest import ingest

    background_tasks.add_task(ingest, payload.collection)

    return {
        "status": "started",
        "message": f"Ingesting '{payload.collection}' in the background. Check server logs for progress.",
    }


@app.get("/health", tags=["System"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    """
    settings = get_settings()

    qdrant_status = "ok"
    try:
        from app.rag.qdrant_client import get_qdrant_client
        client = get_qdrant_client()
        client.get_collections()
    except Exception as e:
        qdrant_status: str = f"error: {str(e)[:50]}"

    redis_status = "ok"
    try:
        from app.agent.memory import _get_redis
        r = _get_redis()
        r.ping()
    except Exception as e:
        redis_status: str = f"error: {str(e)[:50]}"

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
    return {
        "name": "Customer Support Agent",
        "status": "running",
        "docs": "/docs",
    }

@app.post("/clear-collections", tags=["System"])
async def clear_collection():
    from app.rag.qdrant_client import delete_collection
    for collection in ["products", "faqs", "policies"]:
        delete_collection(collection)
    return {
        "status": "ok"
    }

@app.get("/test-micro", tags=["System"])
async def test_micro():
    # from app.agent.tools import _shop_request
    from app.rag.qdrant_client import search_collection
    # result = _shop_request("GET", "/api/order/ORD-C0B7CD56")
    # result = search_collection("faqs", "How do I place an order", top_k=3, score_threshold=0.45)
    result = search_collection("products", "pin downs", top_k=3, score_threshold=0.45)
    return {
        "result": result,
        "status": "ok"
    }
