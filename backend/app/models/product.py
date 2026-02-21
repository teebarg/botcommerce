from typing import List, Optional
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
    measurement: Optional[int]

class VariantWithStatus(BaseModel):
    id: Optional[int] = None
    price: Optional[float] = Field(None, gt=0)
    old_price: Optional[float] = 0.0
    inventory: int = Field(..., ge=0)
    size: Optional[str] = None
    color: Optional[str] = None
    measurement: Optional[int] = None
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
    # image: Optional[str] = None
    variants: Optional[List[ProductVariant]] = None
    ratings: float
    categories: Optional[List[Category]] = []
    collections: Optional[List[Collection]] = []
    # brand: Optional[Brand] = None
    # tags: Optional[List[Tag]] = []
    # images: Optional[List[ProductImage]] = []
    # reviews: Optional[List[Review]] = []
    active: Optional[bool] = True
    is_new: Optional[bool] = False


class Product(BaseModel):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    variants: Optional[List[ProductVariant]] = None
    ratings: float
    # categories: Optional[List[Category]] = []
    collections: Optional[List[Collection]] = []
    # brand: Optional[Brand] = None
    # tags: Optional[List[Tag]] = []
    images: Optional[List[ProductImage]] = []
    reviews: Optional[List[Review]] = []
    active: Optional[bool] = True
    is_new: Optional[bool] = False
    # embedding: Optional[List[float]] = None

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
    measurement: Optional[int] = None
    age: Optional[str] = None

class SearchProduct(BaseModel):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    categories: Optional[List[SearchCategory]] = []
    collections: Optional[List[SearchCollection]] = []
    images: Optional[List[str]] = []
    variants: Optional[List[SearchVariant]] = []
    average_rating: Optional[float] = None
    review_count: Optional[int] = None
    max_variant_price: Optional[float] = None
    min_variant_price: Optional[float] = None
    active: Optional[bool] = True
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    catalogs: Optional[List[str]] = None
    is_new: Optional[bool] = False

class Facets(BaseModel):
    category_slugs: Optional[dict[str, int]] = None
    sizes: Optional[dict[str, int]] = None
    colors: Optional[dict[str, int]] = None
    ages: Optional[dict[str, int]] = None

class FeedProducts(BaseModel):
    products: List[SearchProduct]
    facets: Facets
    total_count: int
    suggestions: List[str]
    limit: int
    feed_seed: float | None
    next_cursor: str | None

class SearchProducts(BaseModel):
    products: List[SearchProduct]
    facets: Facets
    suggestions: List[str]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class IndexProducts(BaseModel):
    featured: List[SearchProduct]
    arrival: List[SearchProduct]
    trending: List[SearchProduct]

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
    measurement: Optional[int] = None
    age: Optional[str] = None
    inventory: Optional[int] = None
    active: Optional[bool] = None
    is_new: Optional[bool] = None
    price: Optional[float] = 0
    old_price: Optional[float] = 0

class ImagesBulkUpdate(BaseModel):
    image_ids: List[int]
    data: ImageMetadata

class ProductImageBulkUrls(BaseModel):
    urls: list[str]

class ProductLite(BaseModel):
    id: int
    name: str
    slug: str
    sku: str
    variants: Optional[List[ProductVariant]] = []
    images: Optional[List[ProductImage]] = []

class ReviewStatus(BaseModel):
    has_purchased: bool
    has_reviewed: bool

class CategoryWithProducts(BaseModel):
    id: int
    name: Optional[str] = None
    slug: str = Field(..., min_length=1)
    products: Optional[List[SearchProduct]] = None
