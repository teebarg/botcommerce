from fastapi import APIRouter, HTTPException, Query, Depends
from app.prisma_client import prisma as db
from app.models.faq import FAQ, FAQCreate, FAQUpdate
from typing import Optional, List
from app.core.deps import get_current_superuser
from app.models.generic import Message

router = APIRouter()

@router.get("/")
async def list_faqs(
    query: Optional[str] = Query(None, min_length=1, description="Search query for FAQ questions"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status")
)-> List[FAQ]:
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

@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_faq(faq: FAQCreate)-> FAQ:
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


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
async def update_faq(faq_update: FAQUpdate, id: int)-> FAQ:
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

@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_faq(id: int)-> Message:
    """Delete a FAQ entry"""
    existing_faq = await db.faq.find_unique(where={"id": id})
    if not existing_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    await db.faq.delete(where={"id": id})
    return Message(detail="FAQ deleted successfully")
