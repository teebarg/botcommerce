from fastapi import FastAPI, HTTPException, Request
from worker import process_pending_jobs, compute_similarity, generate_description
from starlette.middleware.cors import CORSMiddleware
from db import database
import logging
from contextlib import asynccontextmanager
import asyncio
from typing import List, Optional
from config import settings
from rag import fetch_db, build_corpus, index_corpus
from chat import assistant
from pydantic import BaseModel
from uuid import uuid4

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
            LIMIT 20;
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


@app.post("/index-corpus")
async def post_index_corpus():
    try:
        raw_data = await fetch_db()
        corpus = await build_corpus(raw_data)
        await index_corpus(corpus)
        return {"status": "ok", "message": "Corpus indexed successfully"}
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))


class Message(BaseModel):
    message: str


class ChatRequest(BaseModel):
    user_message: str
    user_id: Optional[int] = None
    conversation_uuid: Optional[str] = None


@app.post("/chat")
async def chat_endpoint(payload: ChatRequest):
    async with database.pool.acquire() as conn:
        if payload.conversation_uuid:
            conversation = await conn.fetchrow(
                "SELECT * FROM conversations WHERE conversation_uuid = $1",
                payload.conversation_uuid,
            )
            if not conversation:
                raise HTTPException(status_code=404, detail="Chat not found")
        else:
            conversation_uuid = str(uuid4())
            conversation = await conn.fetchrow(
                """
                INSERT INTO conversations (conversation_uuid, user_id, last_active)
                VALUES ($1, $2, now())
                RETURNING *
                """,
                conversation_uuid,
                payload.user_id,
            )

        conversation_uuid = str(conversation["conversation_uuid"])
        conversation_id = conversation["id"]

        messages = await conn.fetch(
            "SELECT sender, content FROM messages WHERE conversation_id=$1 ORDER BY timestamp ASC",
            conversation_id,
        )

        history = []
        temp_user_msg = None
        for msg in messages:
            if msg["sender"] == "USER":
                temp_user_msg = msg["content"]
                history.append({"user": temp_user_msg, "assistant": ""})
            elif msg["sender"] == "BOT" and history:
                history[-1]["assistant"] = msg["content"]

        history_text = "\n\nRECENT CONVERSATION:\n"
        history_text += "\n".join([
            f"User: {msg['user']}\nAssistant: {msg['assistant']}"
            for msg in history
        ])
        
        reply = await assistant.chat(payload.user_message, history_text)

        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO messages (conversation_id, content, sender)
                VALUES ($1, $2, 'USER')
                """,
                conversation_id,
                payload.user_message,
            )
            await conn.execute(
                """
                INSERT INTO messages (conversation_id, content, sender)
                VALUES ($1, $2, 'BOT')
                """,
                conversation_id,
                reply,
            )
            await conn.execute(
                "UPDATE conversations SET last_active = now() WHERE id = $1",
                conversation_id,
            )

        return {
            "reply": reply,
            "conversation_uuid": conversation_uuid,
        }
