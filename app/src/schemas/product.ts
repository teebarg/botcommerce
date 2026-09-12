import { z } from "zod";

import { ProductStatusSchema } from "./enums";
import { CursorSchema } from "./common";
import { booleanParam } from "./search-schemas";

export const CategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    image: z.string().optional(),
    is_active: z.boolean(),
    display_order: z.number().default(0),
});

export const CollectionSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean(),
    created_at: z.string().optional(),
});

export const ImageLiteSchema = z.object({
    id: z.number(),
    image: z.string(),
    order: z.number(),
});

export const ProductVariantSchema = z.object({
    id: z.number(),
    sku: z.string(),
    product_id: z.number(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number(),
    inventory: z.number(),
    size: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    length: z.number().nullable().optional(),
    age: z.string().nullable().optional(),
    is_new: z.boolean().optional(),
});

export const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    images: z.array(ImageLiteSchema),
    variants: z.array(ProductVariantSchema).optional(),
    categories: z.array(CategorySchema),
    collections: z.array(CollectionSchema),
    active: z.boolean(),
    is_new: z.boolean(),
    in_stock: z.boolean(),
});

export const ProductImageSchema = z.object({
    id: z.number(),
    image: z.string(),
    product: ProductSchema.optional(),
    product_id: z.number().optional(),
});

export const GalleryImageSchema = z.object({
    id: z.number(),
    image: z.string(),
    images: z.array(ImageLiteSchema),
    order: z.number(),
    product_id: z.number().optional(),
    product: ProductSchema.optional(),
});

export const PaginatedGalleryImagesSchema = CursorSchema.extend({
    items: z.array(GalleryImageSchema),
});

export const ProductSearchSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    image: z.string(),
    images: z.array(z.string()),
    variants: z.array(ProductVariantSchema).nullable(),
    active: z.boolean(),
    is_new: z.boolean().optional(),
    in_stock: z.boolean(),
});

export const ProductFeedSchema = z.object({
    products: z.array(ProductSearchSchema),
    next_cursor: z.string(),
    limit: z.number(),
    total_count: z.number(),
});

export const WishItemSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    product: ProductSchema,
});

export const PaginatedProductImagesSchema = CursorSchema.extend({
    items: z.array(ProductImageSchema),
});

export const ReviewStatusSchema = z.object({
    has_purchased: z.boolean(),
    has_reviewed: z.boolean(),
});

export const CategoriesProductsSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    products: z.array(ProductSearchSchema),
});

export const FeedQuerySchema = z.object({
    search: z.string().optional(),
    sort: z.enum(["min_price:asc", "min_price:desc", "id:desc"]).optional(),
    cat_ids: z.string().optional(),
    collections: z.string().optional(),
    sizes: z.string().optional(),
    ages: z.string().optional(),
    width: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    min_price: z.coerce.number().optional(),
    max_price: z.coerce.number().optional(),
    cursor: z.string().optional(),
});

export const GalleryQuerySchema = z.object({
    cursor: z.string().optional(),
    active: booleanParam,
    sort: z.enum(["newest", "oldest"]).default("newest"),
    inventory: z.enum(["all", "in_stock", "out_of_stock"]).default("all"),
    category_slug: z.string().optional(),
    name: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export type FeedQuery = z.infer<typeof FeedQuerySchema>;
export type GalleryQuery = z.infer<typeof GalleryQuerySchema>;
export type CategoriesWithProducts = z.infer<typeof CategoriesProductsSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type ProductFeed = z.infer<typeof ProductFeedSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type Collection = z.infer<typeof CollectionSchema>;

export type WishItem = z.infer<typeof WishItemSchema>;
export type Wishlist = WishItem[];

export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ImageLite = z.infer<typeof ImageLiteSchema>;
export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type PaginatedGalleryImages = z.infer<typeof PaginatedGalleryImagesSchema>;

export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
