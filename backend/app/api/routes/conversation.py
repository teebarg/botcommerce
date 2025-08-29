from fastapi import APIRouter, HTTPException, Query

from app.prisma_client import prisma as db
from pydantic import BaseModel
from typing import Optional

from prisma.models import Conversation, Message
from prisma.enums import ConversationStatus, MessageSender
from app.core.deps import UserDep
from google import genai
from app.core.config import settings
from math import ceil
from app.services.chatbot import get_relevant_faqs, enhance_prompt_with_data

from pydantic import BaseModel

import uuid

client = genai.Client(api_key=settings.GEMINI_API_KEY)

router = APIRouter()

ECOMMERCE_SYSTEM_PROMPT = """
You're a friendly and helpful customer support assistant for our online store.

Your job is to make shopping easier and more enjoyable by:
- Answering product questions (like sizes, colors, categories, or availability)
- Helping with orders and delivery status
- Explaining shipping options (Standard, Express, Pickup)
- Assisting with returns, payments, and account issues
- Recommending products when customers need suggestions

Store info you can use:
- Payment options: Credit Card, Cash on Delivery, Bank Transfer, Paystack
- Shipping: Standard, Express, or Pickup
- Order statuses: Pending, Paid, Processing, Shipped, Delivered, Canceled, Refunded
- Customers can save addresses, add favorites, and use coupon codes
- Products may have different variants, belong to categories/brands/collections, and show reviews with ratings

When talking to customers:
- Be warm, conversational, and human — not robotic
- Be clear and helpful, like a great shop assistant
- If you're unsure about something, kindly let them know and suggest checking their email or account page for updates
- Be friendly and professional
- Address their specific question or concern
- Provide concise but comprehensive answers
- Recommend relevant products when appropriate
- Only recommend products from our store
- Always thank customers for their patience and business

When suggesting or showing products, you must format them using Markdown like this (with image, product name, price, and link):

---
* ![Image](https://cdn.example.com/product.jpg)  
* **🛍️ Product Name**  
* 💵 **Price:** ₦12,999.99  
* 🔗 [View Product](https://example.com/product-link)
---

Don not show products that are not in the provided context.

Be concise, warm, and natural in tone. Use emojis when appropriate.

Ready to help customers with whatever they need, like you're chatting in a store!
"""

class MessageCreate(BaseModel):
    content: str


class ConversationUpdate(BaseModel):
    status: Optional[ConversationStatus] = None


@router.post("/conversations")
async def create_conversation(user: UserDep):
    """Create a new conversation"""
    data = {
        "conversation_uuid": str(uuid.uuid4()),
        "status": ConversationStatus.ACTIVE,
    }

    if user:
        data["user"] = {"connect": {"id": user.id}}

    new_conversation = await db.conversation.create(data=data)
    return new_conversation


@router.get("/conversations")
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


@router.get("/conversations/{id}")
async def get_conversation(id: int) -> Conversation:
    """Get a conversation by ID with its messages"""
    conversation = await db.conversation.find_unique(
        where={"id": id},
        include={"messages": True}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/conversations/uuid/{uid}")
async def get_conversation_by_uuid(uid: str) -> Conversation:
    """Get a conversation by UUID with its messages"""
    conversation = await db.conversation.find_unique(
        where={"conversation_uuid": uid},
        include={"messages": True}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/conversations/{id}")
async def update_conversation(conversation_update: ConversationUpdate, id: int) -> Conversation:
    """Update a conversation"""
    existing_conversation = await db.conversation.find_unique(where={"id": id})
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    update_data = {}
    if conversation_update.status is not None:
        update_data["status"] = conversation_update.status
    updated_conversation = await db.conversation.update(where={"id": id}, data=update_data)
    return updated_conversation


@router.delete("/conversations/{id}")
async def delete_conversation(id: int):
    """Delete a conversation and all its messages"""
    existing_conversation = await db.conversation.find_unique(where={"id": id})
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.conversation.delete(where={"id": id})
    return {"message": "Conversation deleted successfully"}


# Message Endpoints
@router.post("/conversations/{uid}/messages")
async def create_message(user: UserDep, message: MessageCreate, uid: str):
    """Create a new message in a conversation"""

    conversation = await db.conversation.find_unique(where={"conversation_uuid": uid})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_id = user.id if user else None

    try:
        await db.message.create(
            data={
                "conversation": {"connect": {"id": conversation.id}},
                "content": message.content,
                "sender": MessageSender.USER,
            }
        )

        # Get relevant product information
        product_info = await enhance_prompt_with_data(user_message=message.content, user_id=user_id)

        faqs = await get_relevant_faqs(message.content)

        messages = await db.message.find_many(
            where={"conversation_id": conversation.id},
            order={"timestamp": "asc"}
        )

        ai_messages = []

        initial_user_message_content = ECOMMERCE_SYSTEM_PROMPT
        if faqs:
            initial_user_message_content += f"\n\nHere are a few FAQs that might help:\n{faqs.strip()}"

        if product_info:
            initial_user_message_content += f"\n\nHere are some product options based on the customer's message:\n{product_info.strip()}"
        else:
            initial_user_message_content += "\n\nNo direct matches found. Please suggest alternatives (e.g. next size up, popular picks, or related items)."

        ai_messages.append({"role": "user", "parts": [{"text": initial_user_message_content}]})

        for msg in messages:
            role = "user" if msg.sender == MessageSender.USER else "model"

            if not msg.content:
                continue

            ai_messages.append({"role": role, "parts": [{"text": msg.content}]})

        response = client.models.generate_content(model='gemini-2.0-flash-001', contents=ai_messages)

        new_message = await db.message.create(
            data={
                "conversation_id": conversation.id,
                "content": response.text,
                "sender": MessageSender.BOT,
            }
        )

        await db.conversation.update(
            where={"id": conversation.id},
            data={}  # Empty update to trigger the @updatedAt
        )

        return new_message

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{uid}/messages")
async def list_messages(
    uid: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
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


@router.get("/messages/{message_id}")
async def get_message(message_id: int) -> Message:
    """Get a specific message by ID"""
    message = await db.message.find_unique(where={"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.delete("/messages/{message_id}")
async def delete_message(message_id: int):
    """Delete a message"""
    message = await db.message.find_unique(where={"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    await db.message.delete(where={"id": message_id})
    return None
