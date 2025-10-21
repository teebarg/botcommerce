from fastapi import APIRouter, HTTPException, Query

from app.prisma_client import prisma as db
from typing import Optional

from prisma.enums import ConversationStatus
from math import ceil

router = APIRouter()

@router.get("/")
async def list_chats(
    user_id: Optional[int] = Query(None),
    status: Optional[ConversationStatus] = Query(None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100)
):
    """List chats with optional filtering"""
    where = {}
    if user_id is not None:
        where["user_id"] = user_id
    if status is not None:
        where["status"] = status

    chats = await db.conversation.find_many(
        where=where,
        skip=skip,
        take=limit,
        order={"last_active": "desc"},
        include={"user": True, "messages": True}
    )
    total = await db.conversation.count(where=where)
    return {
        "chats":chats,
        "skip":skip,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.get("/{uid}")
async def get_chat(uid: str):
    """Get a chat and all its messages"""
    chat = await db.conversation.find_unique(where={"conversation_uuid": uid}, include={"messages": True})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return chat


@router.delete("/{id}")
async def delete_chat(id: int):
    """Delete a chat and all its messages"""
    existing_chat = await db.conversation.find_unique(where={"id": id})
    if not existing_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await db.conversation.delete(where={"id": id})
    return {"message": "Chat deleted successfully"}
