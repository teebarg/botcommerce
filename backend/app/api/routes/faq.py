from fastapi import APIRouter, HTTPException, Query

from app.prisma_client import prisma as db
from prisma.models import FAQ
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    is_active: bool = True


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/", response_model=List[FAQ])
async def list_faqs(
    query: Optional[str] = Query(None, min_length=1, description="Search query for FAQ questions"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status")
):
    """List FAQ entries with optional filtering"""
    where = {}
    if query is not None:
        where["question"] = {"contains": query, "mode": "insensitive"}
    if category is not None:
        where["category"] = category
    if is_active is not None:
        where["is_active"] = is_active

    faqs = await db.faq.find_many(where=where, order={"created_at": "desc"})
    return faqs


@router.get("/{id}", response_model=FAQ)
async def get_faq(id: int):
    """Get a specific FAQ entry by ID"""
    faq = await db.faq.find_unique(where={"id": id})
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq


@router.post("/", response_model=FAQ)
async def create_faq(faq: FAQCreate):
    """Create a new FAQ entry"""
    try:
        new_faq = await db.faq.create(
            data={
                "question": faq.question,
                "answer": faq.answer,
                "category": faq.category,
                "is_active": faq.is_active
            }
        )
        return new_faq
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="A FAQ with this question already exists")
        raise


@router.patch("/{id}", response_model=FAQ)
async def update_faq(faq_update: FAQUpdate, id: int):
    """Update a FAQ entry"""
    existing_faq = await db.faq.find_unique(where={"id": id})
    if not existing_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    update_data = {}
    if faq_update.question is not None:
        update_data["question"] = faq_update.question
    if faq_update.answer is not None:
        update_data["answer"] = faq_update.answer
    if faq_update.category is not None:
        update_data["category"] = faq_update.category
    if faq_update.is_active is not None:
        update_data["is_active"] = faq_update.is_active

    try:
        updated_faq = await db.faq.update(
            where={"id": id},
            data=update_data
        )
        return updated_faq
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="A FAQ with this question already exists")
        raise


@router.delete("/{id}")
async def delete_faq(id: int):
    """Delete a FAQ entry"""
    existing_faq = await db.faq.find_unique(where={"id": id})
    if not existing_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    await db.faq.delete(where={"id": id})
    return None
