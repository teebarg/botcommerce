from fastapi import APIRouter, HTTPException, Query, Depends
from app.prisma_client import prisma as db
from typing import Optional
from prisma.enums import ConversationStatus
from app.models.chat import PaginatedChats, Chat, ChatRequest
from app.models.generic import Message
from app.services.websocket import manager
from app.redis_client import redis_client
from app.core.deps import CurrentUser
from datetime import datetime
from app.services.chat import get_conversation
from app.core.permissions import require_admin

router = APIRouter()

@router.post("/support", dependencies=[Depends(require_admin)])
async def admin_chat(payload: ChatRequest) -> Message:
    """
    Handle admin support chat messages
    """
    conversation = await get_conversation(payload.conversation_uuid)

    customer = redis_client.get(f"chat_user:{payload.conversation_uuid}")
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not connected")

    customer = customer.decode() if isinstance(customer, bytes) else customer

    await db.message.create(
        data={
            "conversation_id": conversation.id,
            "content": payload.user_message,
            "sender": "SYSTEM",
        }
    )

    await manager.send_to_user(
        user_id=customer,
        data={"message": payload.user_message},
        message_type="chat",
    )

    return Message(message="message sent successfully")


@router.post("/")
async def customer_chat(payload: ChatRequest) -> Message:
    """
    Handle customer regular chat messages
    """
    conversation = await get_conversation(payload.conversation_uuid)

    await db.message.create(
        data={
            "conversation_id": conversation.id,
            "content": payload.user_message,
            "sender": "USER",
        }
    )

    await manager.send_to_user(
        user_id=conversation.support_id,
        data={"message": payload.user_message},
        message_type="chat",
    )

    return Message(message="message sent successfully")


@router.post("/handoff", dependencies=[Depends(require_admin)])
async def handoff(payload: ChatRequest, user: CurrentUser) -> Message:
    conversation = await get_conversation(payload.conversation_uuid)

    if conversation.human_connected:
        raise HTTPException(status_code=400, detail="conversation already connected to human")

    customer = redis_client.get(f"chat_user:{payload.conversation_uuid}")

    await db.conversation.update(
        where={"id": conversation.id},
        data={"support_id": user.id, "support_name": f"{user.first_name} {user.last_name}" ,"human_connected": True, "last_active": datetime.utcnow() },
    )

    await manager.send_to_user(
        user_id=customer,
        data={"message": "Human agent will assist you shortly"},
        message_type="chat",
    )

    return Message(message="Handoff request sent successfully")

@router.get("/", dependencies=[Depends(require_admin)])
async def index(
    uuid: Optional[str] = Query(None),
    status: Optional[ConversationStatus] = Query(None),
    cursor: int | None = None,
    limit: int = Query(default=100, ge=1, le=100)
) -> PaginatedChats:
    """List chats with optional filtering"""
    where = {}
    if uuid is not None:
        where["conversation_uuid"] = uuid
    if status is not None:
        where["status"] = status

    chats = await db.conversation.find_many(
        where=where,
        skip=1 if cursor else 0,
        take=limit + 1,
        cursor={"id": cursor} if cursor else None,
        order={"id": "desc"},
        include={"user": True, "messages": True}
    )
    items = chats[:limit]

    return {
        "items": items,
        "next_cursor": items[-1].id if len(chats) > limit else None,
        "limit": limit
    }


@router.get("/{uid}", dependencies=[Depends(require_admin)])
async def get_chat(uid: str) -> Chat:
    """Get a chat and all its messages"""
    chat = await db.conversation.find_unique(where={"conversation_uuid": uid}, include={"messages": True})
    if not chat:
        raise HTTPException(status_code=404, detail="conversation not found")

    return chat


@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete_chat(id: int) -> Message:
    """Delete a chat and all its messages"""
    existing_chat = await db.conversation.find_unique(where={"id": id})
    if not existing_chat:
        raise HTTPException(status_code=404, detail="conversation not found")

    async with db.tx() as tx:
        await tx.message.delete_many(where={"conversation_id": id})
        await tx.conversation.delete(where={"id": id})
        return {"message": "conversation deleted successfully"}
