from fastapi import APIRouter, HTTPException, Query

from app.prisma_client import prisma as db
from typing import Optional
from uuid import uuid4
from app.services.chat import assistant
from prisma.enums import ConversationStatus
from app.models.chat import PaginatedChats, Chat, ChatRequest
from app.models.generic import Message

router = APIRouter()

@router.post("/")
async def chat_endpoint(payload: ChatRequest) -> dict[str, str]:
    if payload.conversation_uuid:
        conversation = await db.conversation.find_unique(
            where={"conversation_uuid": payload.conversation_uuid}
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Chat not found")
    else:
        conversation = await db.conversation.create(
            data={
                "conversation_uuid": str(uuid4()),
                "user_id": payload.user_id,
            }
        )

    messages = await db.message.find_many(
        where={"conversation_id": conversation.id},
        order={"timestamp": "asc"}
    )

    history = []
    for msg in messages:
        if msg.sender == "USER":
            history.append({"user": msg.content, "assistant": ""})
        elif msg.sender == "BOT" and history:
            history[-1]["assistant"] = msg.content

    history_text = "\n\nRECENT CONVERSATION:\n" + "\n".join(
        [f"User: {h['user']}\nAssistant: {h['assistant']}" for h in history]
    )

    reply: str = await assistant.chat(payload.user_message, history_text)

    async with db.tx() as tx:
        await tx.message.create(
            data={
                "conversation_id": conversation.id,
                "content": payload.user_message,
                "sender": "USER",
            }
        )
        await tx.message.create(
            data={
                "conversation_id": conversation.id,
                "content": reply,
                "sender": "BOT",
            }
        )
        await tx.conversation.update(
            where={"id": conversation.id},
            data={},
        )

    return {
        "reply": reply,
        "conversation_uuid": conversation.conversation_uuid,
    }

@router.get("/")
async def index(
    user_id: Optional[int] = Query(None),
    status: Optional[ConversationStatus] = Query(None),
    cursor: int | None = None,
    limit: int = Query(default=100, ge=1, le=100)
) -> PaginatedChats:
    """List chats with optional filtering"""
    where = {}
    if user_id is not None:
        where["user_id"] = user_id
    if status is not None:
        where["status"] = status

    chats = await db.conversation.find_many(
        where=where,
        skip=1 if cursor else 0,
        take=limit + 1,
        cursor={"id": cursor} if cursor else None,
        order={"last_active": "desc"},
        include={"user": True, "messages": True}
    )
    items = chats[:limit]

    return {
        "items": items,
        "next_cursor": items[-1].id if len(chats) > limit else None,
        "limit": limit
    }


@router.get("/{uid}")
async def get_chat(uid: str) -> Chat:
    """Get a chat and all its messages"""
    chat = await db.conversation.find_unique(where={"conversation_uuid": uid}, include={"messages": True})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return chat


@router.delete("/{id}")
async def delete_chat(id: int) -> Message:
    """Delete a chat and all its messages"""
    existing_chat = await db.conversation.find_unique(where={"id": id})
    if not existing_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await db.conversation.delete(where={"id": id})
    return {"message": "Chat deleted successfully"}
