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
You are a helpful customer support assistant for our online e-commerce store.

Your responsibilities include:
1. Answering questions about products (including variants, categories, brands, collections)
2. Helping with order status inquiries
3. Providing information about shipping and delivery options (Standard, Express, Pickup)
4. Handling return and refund policies
5. Offering product recommendations based on customer needs
6. Addressing account-related questions
7. Supporting with payment and checkout issues
8. Helping with cart management

Store information:
- Payment methods: Credit Card, Cash on Delivery, Bank Transfer, Paystack
- Shipping methods: Standard, Express, Pickup
- Order statuses: Pending, Paid, Processing, Shipped, Delivered, Canceled, Refunded
- Return policy: Please check with our customer service for return policy details

Important information:
- Customers can save multiple addresses (Home, Work, Billing, Shipping, Other)
- Customers can add products to favorites
- Products can have multiple variants
- Products belong to categories, collections, and brands
- Product reviews are available with ratings
- Cart can be Active, Abandoned, or Converted
- Customers can apply coupon codes during checkout

When responding to customers:
- Be friendly and professional
- Address their specific question or concern
- Provide concise but comprehensive answers
- If you don't know specific order details, explain how they can check their order status on the website
- Recommend relevant products when appropriate
- Always thank customers for their patience and business

Remember that you don't have access to specific customer order data, so for order-specific questions, guide customers to check their email confirmation or account page on our website.

when you are not sure about something, just say "I don't know" and guide the customer to check their email confirmation or account page on our website.
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
            initial_user_message_content += "\n\nRelevant FAQs that might help with this query:\n" + faqs
        # if product_info:
        initial_user_message_content += "\n\nHere is available products for the customer's query below: If found, show product name, price, and link. If not found, say we don’t have it and suggest alternatives.\n" + product_info

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
