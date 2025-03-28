from typing import List, Optional, Literal
from pydantic import BaseModel, Field, HttpUrl

from app.models.base import BM
from prisma.models import Brand, Category, Collection, Tag, ProductImage, Review, ProductVariant

# Models
class VariantCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Variant name is required")
    slug: str = Field(..., min_length=1, description="Variant slug is required")
    price: float = Field(..., gt=0, description="Price must be positive")
    inventory: int = Field(..., ge=0, description="Inventory cannot be negative")

class VariantUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1)
    slug: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    inventory: Optional[int] = Field(None, ge=0)

class VariantWithStatus(BaseModel):
    name: str = Field(..., min_length=1, description="Variant name is required")
    sku: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be positive")
    inventory: int = Field(..., ge=0, description="Inventory cannot be negative")
    status: Literal["IN_STOCK", "OUT_OF_STOCK"]


# class Product(BM):
#     name: str = Field(..., min_length=1, description="Name is required")
#     description: str = Field(..., min_length=1, description="Description is required")
#     brand_ids: Optional[List[int]] = None
#     category_ids: Optional[List[int]] = None
#     collection_ids: Optional[List[int]] = None
#     tags_ids: Optional[List[int]] = None
#     sku: Optional[str] = None
#     variants: Optional[List[VariantCreate]] = None
#     images: Optional[List[HttpUrl]] = None


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    description: str = Field(..., min_length=1, description="Description is required")
    price: float = Field(..., gt=0, description="Price must be positive")
    old_price: float = Field(..., ge=0, description="Old price must be positive")
    brand_ids: Optional[List[int]] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    sku: Optional[str] = None
    variants: Optional[List[VariantCreate]] = None
    images: Optional[List[HttpUrl]] = None
    status: Literal["IN_STOCK", "OUT_OF_STOCK"] = "IN_STOCK"

class ProductPublic(BaseModel):
    id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = None
    status: Optional[Literal["IN_STOCK", "OUT_OF_STOCK"]] = None
    brand_ids: Optional[List[int]] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    variants: Optional[List[VariantUpdate]] = None
    images: Optional[List[HttpUrl]] = None

class ReviewCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    text: str = Field(..., min_length=1, description="Review text is required")
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")

class ImageUpload(BaseModel):
    file: str  # Base64 encoded file
    file_name: str
    content_type: str
    product_id: int = Field(..., gt=0)

class ImageDelete(BaseModel):
    id: int

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    category_slug: Optional[str] = None
    search: Optional[str] = None
    sort: Literal["asc", "desc"] = "desc"


class ProductPublic(BaseModel):
    id: int


class ProductBrand(BaseModel):
    id: int


class ProductCategory(BaseModel):
    id: int


class ProductCollection(BaseModel):
    id: int


class ProductImages(BaseModel):
    id: int

class Variant(BaseModel):
    id: int
    name: str = Field(..., min_length=1, description="Variant name is required")
    sku: Optional[str] = None
    slug: str = Field(..., min_length=1, description="Variant slug is required")
    price: float = Field(..., gt=0, description="Price must be positive")
    old_price: float = Field(..., ge=0, description="Old price must be positive")
    inventory: int = Field(..., ge=0, description="Inventory cannot be negative")
    status: Literal["IN_STOCK", "OUT_OF_STOCK"]


class Product(BM):
    id: int
    name: str
    sku: Optional[str] = None
    slug: str
    description: str
    price: float
    old_price: float
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
    price: float
    old_price: float
    image: Optional[str] = None
    status: str
    ratings: float
    categories: List[str]
    collections: List[str]
    brand: Optional[str] = None
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []
    reviews: Optional[List[str]] = []
    favorites: Optional[List[str]] = []
    variants: Optional[List[Variant]] = []

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
