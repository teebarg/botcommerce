from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from app.models.generic import ImageUpload
from app.models.base import BM
from prisma.enums import ProductStatus
from app.models.reviews import Review
from app.models.collection import Collection
from app.models.category import Category

class ProductImage(BaseModel):
    id: int
    image: Optional[str] = None
    order: int = 1

class ProductVariant(BaseModel):
    id: int
    sku: str
    status: ProductStatus
    price: float
    old_price: Optional[float] = 0.0
    inventory: int
    age: Optional[str]
    size: Optional[str]
    color: Optional[str]
    width: Optional[int]
    length: Optional[int]

class VariantWithStatus(BaseModel):
    id: Optional[int] = None
    price: Optional[float] = Field(None, gt=0)
    old_price: Optional[float] = 0.0
    inventory: int = Field(..., ge=0)
    size: Optional[str] = None
    color: Optional[str] = None
    width: Optional[int] = None
    length: Optional[int] = None
    age: Optional[str] = None

class ProductCreate(BaseModel):
    name: Optional[str] = Field(None)
    description: Optional[str] = None
    brand_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    active: Optional[bool] = True
    is_new: Optional[bool] = False

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    sku: Optional[str] = None
    brand_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    active: Optional[bool] = True
    is_new: Optional[bool] = None

class ReviewCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    text: str = Field(..., min_length=1, description="Review text is required")
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")


class ProductLite(BaseModel):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    description: Optional[str] = None
    images: Optional[List[ProductImage]] = []
    variants: Optional[List[ProductVariant]] = None
    active: Optional[bool] = True
    is_new: Optional[bool] = False


class Product(BaseModel):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    description: Optional[str] = None
    variants: Optional[List[ProductVariant]] = None
    categories: Optional[List[Category]] = []
    collections: Optional[List[Collection]] = []
    active: Optional[bool] = True
    is_new: Optional[bool] = False

class SearchCategory(BaseModel):
    id: int
    name: Optional[str] = None
    slug: str

class SearchCollection(BaseModel):
    id: int
    name: Optional[str] = None
    slug: str

class SearchVariant(BaseModel):
    id: int
    price: Optional[float] = 0
    old_price: Optional[float] = 0
    inventory: int = 0
    size: Optional[str] = None
    color: Optional[str] = None
    width: Optional[int] = None
    length: Optional[int] = None
    age: Optional[str] = None

class ProductSearch(BaseModel):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    image: Optional[str] = None
    status: Literal["IN STOCK", "OUT OF STOCK"] = "IN STOCK"
    variants: Optional[List[SearchVariant]] = []
    active: Optional[bool] = True
    # sizes: Optional[List[str]] = None
    # ages: Optional[List[str]] = None
    # colors: Optional[List[str]] = None
    # widths: Optional[List[int]] = None
    # lengths: Optional[List[int]] = None
    is_new: Optional[bool] = False

class Facets(BaseModel):
    category_slugs: Optional[dict[str, int]] = None
    sizes: Optional[dict[str, int]] = None
    colors: Optional[dict[str, int]] = None
    ages: Optional[dict[str, int]] = None

class FeedProducts(BaseModel):
    products: List[ProductSearch]
    facets: Facets
    total_count: int
    suggestions: List[str]
    limit: int
    feed_seed: float | None
    next_cursor: str | None

class SearchProducts(BaseModel):
    products: List[ProductSearch]
    facets: Facets
    suggestions: List[str]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class IndexProducts(BaseModel):
    featured: List[ProductSearch]
    arrival: List[ProductSearch]
    trending: List[ProductSearch]

class ProductCreateBundle(ProductCreate):
    images: Optional[List[ImageUpload]] = None
    variants: Optional[List[VariantWithStatus]] = None

class ProductImageMetadata(ProductCreate):
    variants: Optional[List[VariantWithStatus]] = None

class ImageMetadata(BaseModel):
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None
    size: Optional[str] = None
    color: Optional[str] = None
    width: Optional[int] = None
    length: Optional[int] = None
    age: Optional[str] = None
    inventory: Optional[int] = None
    active: Optional[bool] = None
    is_new: Optional[bool] = None
    price: Optional[float] = None
    old_price: Optional[float] = None

class ImagesBulkUpdate(BaseModel):
    image_ids: List[int]
    data: ImageMetadata

class ProductImageBulkUrls(BaseModel):
    urls: list[str]

class ReviewStatus(BaseModel):
    has_purchased: bool
    has_reviewed: bool

class CategoryWithProducts(BaseModel):
    id: int
    name: Optional[str] = None
    slug: str = Field(..., min_length=1)
    products: Optional[List[ProductSearch]] = None
