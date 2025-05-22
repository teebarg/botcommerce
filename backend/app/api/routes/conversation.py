from fastapi import APIRouter, HTTPException, Query, Path

from app.prisma_client import prisma as db
from pydantic import BaseModel
from typing import Optional

from prisma.models import Conversation, Message
from prisma.enums import ConversationStatus, MessageSender
from app.core.deps import UserDep
from google import genai
from app.core.config import settings
from math import ceil

client = genai.Client(api_key=settings.GEMINI_API_KEY)

router = APIRouter()


# Pydantic models for request/response validation
class MessageCreate(BaseModel):
    content: str


class ConversationUpdate(BaseModel):
    status: Optional[ConversationStatus] = None


# Conversation Endpoints
@router.post("/conversations")
async def create_conversation(user: UserDep):
    """Create a new conversation"""
    new_conversation = await db.conversation.create(
        data={
            "conversation_uuid": str(uuid.uuid4()),
            "user_id": user.id if user else None,
            "status": ConversationStatus.ACTIVE,
        }
    )
    return new_conversation


@router.get("/conversations")
async def list_conversations(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[ConversationStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
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
        order={"last_active": "desc"}
    )
    total = await db.conversation.count(where=where)
    return {
        "conversations":conversations,
        "page":skip,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: int = Path(..., description="The ID of the conversation to retrieve")
) -> Conversation:
    """Get a conversation by ID with its messages"""
    conversation = await db.conversation.find_unique(
        where={"id": conversation_id},
        include={"messages": True}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/conversations/uuid/{uid}")
async def get_conversation_by_uuid(
    uid: str = Path(..., description="The UUID of the conversation to retrieve"),
) -> Conversation:
    """Get a conversation by UUID with its messages"""
    conversation = await db.conversation.find_unique(
        where={"conversation_uuid": uid},
        include={"messages": True}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/conversations/{conversation_id}")
async def update_conversation(
    conversation_update: ConversationUpdate,
    conversation_id: int = Path(..., description="The ID of the conversation to update"),
) -> Conversation:
    """Update a conversation"""
    # First check if conversation exists
    existing_conversation = await db.conversation.find_unique(where={"id": conversation_id})
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Prepare update data
    update_data = {}
    if conversation_update.status is not None:
        update_data["status"] = conversation_update.status

    # Update conversation
    updated_conversation = await db.conversation.update(
        where={"id": conversation_id},
        data=update_data
    )
    return updated_conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int = Path(..., description="The ID of the conversation to delete"),
):
    """Delete a conversation and all its messages"""
    existing_conversation = await db.conversation.find_unique(where={"id": conversation_id})
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.conversation.delete(where={"id": conversation_id})
    return {"message": "Conversation deleted successfully"}


# Message Endpoints
@router.post("/conversations/{uid}/messages")
async def create_message(
    message: MessageCreate,
    uid: str = Path(..., description="The UUID of the conversation to add a message to"),
) -> Message:
    """Create a new message in a conversation"""
    # Check if conversation exists
    conversation = await db.conversation.find_unique(where={"conversation_uuid": uid})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Create message
    await db.message.create(
        data={
            "conversation_id": conversation.id,
            "content": message.content,
            "sender": MessageSender.USER,
        }
    )

    response = client.models.generate_content(
        model='gemini-2.0-flash-001', contents=message.content
    )

    new_message = await db.message.create(
        data={
            "conversation_id": conversation.id,
            "content": response.text,
            "sender": MessageSender.BOT,
        }
    )

    # Update conversation's last_active timestamp (handled by @updatedAt in Prisma)
    await db.conversation.update(
        where={"id": conversation.id},
        data={}  # Empty update to trigger the @updatedAt
    )

    return new_message


@router.get("/conversations/{uid}/messages")
async def list_messages(
    uid: str = Path(..., description="The UUID of the conversation to list messages for"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """List messages for a conversation"""
    # Check if conversation exists
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


@router.get("/messages/{message_id}")
async def get_message(
    message_id: int = Path(..., description="The ID of the message to retrieve")
) -> Message:
    """Get a specific message by ID"""
    message = await db.message.find_unique(where={"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: int = Path(..., description="The ID of the message to delete")
):
    """Delete a message"""
    message = await db.message.find_unique(where={"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    await db.message.delete(where={"id": message_id})
    return None
