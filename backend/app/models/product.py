from typing import List, Optional, Literal
from pydantic import BaseModel, Field

from app.models.base import BM
from prisma.models import Brand, Category, Collection, Tag, ProductImage, Review, ProductVariant

# Models
class VariantWithStatus(BaseModel):
    sku: Optional[str] = None
    price: float = Field(..., gt=0)
    old_price: Optional[float] = 0.0
    inventory: int = Field(..., ge=0)
    status: Literal["IN_STOCK", "OUT_OF_STOCK"]
    size: Optional[str] = None
    color: Optional[str] = None

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    brand_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    sku: Optional[str] = None
    status: Literal["IN_STOCK", "OUT_OF_STOCK"] = "IN_STOCK"

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = None
    status: Optional[Literal["IN_STOCK", "OUT_OF_STOCK"]] = None
    brand_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None

class ReviewCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    text: str = Field(..., min_length=1, description="Review text is required")
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")


class Product(BM):
    id: int
    name: str
    sku: Optional[str] = None
    slug: str
    description: str
    image: Optional[str] = None
    status: str
    variants: Optional[List[ProductVariant]] = None
    ratings: float
    categories: Optional[List[Category]] = []
    collections: Optional[List[Collection]] = []
    brand: Optional[Brand] = None
    tags: Optional[List[Tag]] = []
    images: Optional[List[ProductImage]] = []
    reviews: Optional[List[Review]] = []

class SearchProduct(BaseModel):
    id: int
    name: str
    sku: Optional[str] = None
    slug: str
    description: str
    image: Optional[str] = None
    status: str
    ratings: float
    categories: List[str]
    collections: List[str]
    brand: Optional[str] = None
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []
    reviews: Optional[List[Review]] = []
    favorites: Optional[List[str]] = []
    variants: Optional[List[ProductVariant]] = []
    average_rating: Optional[float] = None
    review_count: Optional[int] = None

class Facets(BaseModel):
    brand: dict[str, int]
    categories: dict[str, int]
    collections: dict[str, int]

class SearchProducts(BaseModel):
    products: List[SearchProduct]
    facets: Facets
    page: int
    limit: int
    total_count: int
    total_pages: int

class Products(BaseModel):
    products: list[Product]
    page: int
    limit: int
    total_count: int
    total_pages: int
