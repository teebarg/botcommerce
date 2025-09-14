from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.generic import ImageUpload

from app.models.base import BM
from prisma.models import Category, Collection, Tag, ProductImage, Review, ProductVariant

class VariantWithStatus(BaseModel):
    id: Optional[int] = None
    price: Optional[float] = Field(None, gt=0)
    old_price: Optional[float] = 0.0
    inventory: int = Field(..., ge=0)
    size: Optional[str] = None
    color: Optional[str] = None
    measurement: Optional[int] = None

class ProductCreate(BaseModel):
    name: Optional[str] = Field(None)
    description: Optional[str] = None
    brand_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    active: Optional[bool] = True

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    sku: Optional[str] = None
    brand_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tags_ids: Optional[List[int]] = None
    active: Optional[bool] = True

class ReviewCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    text: str = Field(..., min_length=1, description="Review text is required")
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")


class Product(BM):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    variants: Optional[List[ProductVariant]] = None
    ratings: float
    categories: Optional[List[Category]] = []
    collections: Optional[List[Collection]] = []
    # brand: Optional[Brand] = None
    tags: Optional[List[Tag]] = []
    images: Optional[List[ProductImage]] = []
    reviews: Optional[List[Review]] = []
    active: Optional[bool] = True

class SearchProduct(BaseModel):
    id: int
    name: Optional[str] = None
    sku: Optional[str] = None
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    ratings: float
    categories: Optional[List[Category]] = []
    category_slugs: List[str]
    collections: Optional[List[Collection]] = []
    collection_slugs: List[str]
    # brand: Optional[str] = None
    tags: Optional[List[str]] = []
    images: Optional[List[ProductImage]] = []
    sorted_images: Optional[List[str]] = []
    reviews: Optional[List[Review]] = []
    favorites: Optional[List[str]] = []
    variants: Optional[List[ProductVariant]] = []
    average_rating: Optional[float] = None
    review_count: Optional[int] = None
    max_variant_price: Optional[float] = None
    min_variant_price: Optional[float] = None
    active: Optional[bool] = True
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None

class Facets(BaseModel):
    # brand: Optional[dict[str, int]] = None
    category_slugs: Optional[dict[str, int]] = None
    collection_slugs: Optional[dict[str, int]] = None
    sizes: Optional[dict[str, int]] = None
    colors: Optional[dict[str, int]] = None

class SearchProducts(BaseModel):
    products: List[SearchProduct]
    facets: Facets
    suggestions: List[str]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class Products(BaseModel):
    products: list[Product]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class ProductCreateBundle(ProductCreate):
    images: Optional[List[ImageUpload]] = None
    variants: Optional[List[VariantWithStatus]] = None

class ProductBulkImages(BaseModel):
    images: Optional[List[ImageUpload]] = None

class ProductImageMetadata(ProductCreate):
    variants: Optional[List[VariantWithStatus]] = None

class ImageMetadata(BaseModel):
    category_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None
    size: Optional[str] = None
    color: Optional[str] = None
    measurement: Optional[int] = None
    inventory: Optional[int] = None
    active: Optional[bool] = True
    price: Optional[float] = None
    old_price: Optional[float] = None

class ImagesBulkUpdate(BaseModel):
    image_ids: List[int]
    data: ImageMetadata
