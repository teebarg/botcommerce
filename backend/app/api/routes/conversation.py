from fastapi import APIRouter, HTTPException, Query

from app.prisma_client import prisma as db
from typing import Optional

from prisma.enums import ConversationStatus
from math import ceil

router = APIRouter()


@router.get("/")
async def list_conversations(
    user_id: Optional[int] = Query(None),
    status: Optional[ConversationStatus] = Query(None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100)
):
    """List conversations with optional filtering"""
    where = {}
    if user_id is not None:
        where["user_id"] = user_id
    if status is not None:
        where["status"] = status

    conversations = await db.conversation.find_many(
        where=where,
        skip=skip,
        take=limit,
        order={"last_active": "desc"},
        include={"user": True, "messages": True}
    )
    total = await db.conversation.count(where=where)
    return {
        "conversations":conversations,
        "skip":skip,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.delete("/{id}")
async def delete_conversation(id: int):
    """Delete a conversation and all its messages"""
    existing_conversation = await db.conversation.find_unique(where={"id": id})
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.conversation.delete(where={"id": id})
    return {"message": "Conversation deleted successfully"}


@router.get("/{uid}/messages")
async def list_messages(
    uid: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100)
):
    """List messages for a conversation"""
    conversation = await db.conversation.find_unique(where={"conversation_uuid": uid})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = await db.message.find_many(
        where={"conversation_id": conversation.id},
        skip=skip,
        take=limit,
        order={"timestamp": "asc"}
    )
    return messages
