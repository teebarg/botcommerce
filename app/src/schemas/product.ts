import { z } from "zod";

import { ProductStatusSchema } from "./enums";
import { ReviewSchema } from "./review";
import { AuditSchema } from "./base";
import { CursorSchema, PagSchema } from "./common";

export const DBCatalogSchema = z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    view_count: z.number(),
    products_count: z.number().optional(),
    is_active: z.boolean(),
    created_at: z.string().optional(),
});

export const CategorySchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        image: z.string().optional(),
        is_active: z.boolean(),
        display_order: z.number().default(0),
        parent_id: z.number().nullable(),
        parent: z.null(),
        subcategories: z.array(z.any()).optional(),
        products: z.null(),
    })
    .merge(AuditSchema);

export const CollectionSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        is_active: z.boolean(),
        products: z.null(),
    })
    .merge(AuditSchema);

export const ProductVariantLiteSchema = z.object({
    id: z.number(),
    sku: z.string(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number(),
    inventory: z.number(),
    size: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    measurement: z.number().nullable().optional(),
    age: z.string().nullable().optional(),
});

export const ProductLiteSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    variants: z.array(ProductVariantLiteSchema).optional(),
    categories: z.array(CategorySchema),
    collections: z.array(CollectionSchema),
    active: z.boolean(),
    product_id: z.number().optional(),
    status: ProductStatusSchema,
    is_new: z.boolean().optional(),
});

export const ProductImageSchema = z.object({
    id: z.number(),
    image: z.string(),
    product: ProductLiteSchema.optional(),
    product_id: z.number().optional(),
    created_at: z.string().optional(),
});

export const ProductVariantSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    sku: z.string(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number(),
    inventory: z.number(),
    size: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    measurement: z.number().nullable().optional(),
    age: z.string().nullable().optional(),
    order_items: z.null(),
    cart_items: z.null(),
    product: ProductLiteSchema.optional(),
});

export const ProductSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        sku: z.string(),
        description: z.string(),
        image: z.string(),
        variants: z.array(ProductVariantLiteSchema).optional(),
        ratings: z.number(),
        categories: z.array(CategorySchema),
        collections: z.array(CollectionSchema),
        tags: z.null(),
        images: z.array(ProductImageSchema),
        reviews: z.array(ReviewSchema),
        active: z.boolean(),
        is_new: z.boolean(),
    })
    .merge(AuditSchema);

export const SearchVariantSchema = z.object({
    id: z.number(),
    sku: z.string(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number(),
    inventory: z.number(),
    size: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    measurement: z.number().nullable().optional(),
    age: z.string().nullable().optional(),
    is_new: z.boolean().optional(),
});

export const SearchCollectionSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
});

export const SearchCategorySchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
});

export const ProductSearchSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    price: z.number(),
    old_price: z.number(),
    image: z.string(),
    status: ProductStatusSchema,
    variants: z.array(SearchVariantSchema).nullable(),
    categories: z.array(SearchCategorySchema),
    collections: z.array(SearchCollectionSchema),
    images: z.array(z.string()),
    average_rating: z.number(),
    review_count: z.number(),
    max_variant_price: z.number(),
    min_variant_price: z.number(),
    active: z.boolean(),
    sizes: z.array(z.string()),
    colors: z.array(z.string()),
    ages: z.array(z.string()),
    measurements: z.array(z.number()),
    is_new: z.boolean().optional(),
});

export const CatalogSchema = z
    .object({
        id: z.number(),
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        products: z.array(ProductSearchSchema),
        products_count: z.number(),
        view_count: z.number(),
        is_active: z.boolean(),
    })
    .merge(AuditSchema);

export const PaginatedCatalogSchema = PagSchema.extend({
    catalogs: z.array(CatalogSchema),
});

export const FacetSchema = z.object({
    category_slugs: z.record(z.string(), z.string()).optional(),
    sizes: z.record(z.string(), z.string()).optional(),
    colors: z.record(z.string(), z.string()).optional(),
    ages: z.record(z.string(), z.string()).optional(),
});

export const PaginatedProductSearchSchema = PagSchema.extend({
    products: z.array(ProductSearchSchema),
    facets: FacetSchema.optional(),
    suggestions: z.array(z.string()),
});

export const ProductFeedSchema = z.object({
    products: z.array(ProductSearchSchema),
    facets: FacetSchema.optional(),
    suggestions: z.array(z.string()),
    feed_seed: z.number(),
    next_cursor: z.string(),
    limit: z.number(),
    total_count: z.number(),
});

export const WishItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    user_id: z.number().optional(),
    product_id: z.number().optional(),
    product: ProductSchema,
    image: z.string(),
    created_at: z.string().optional(),
});

export const WishlistSchema = z.object({
    wishlists: z.array(WishItemSchema),
});

export const SearchCatalogSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    view_count: z.number(),
    is_active: z.boolean(),
    products: z.array(ProductSearchSchema),
    limit: z.number(),
    total_count: z.number(),
    next_cursor: z.number().optional(),
});

export const PaginatedProductImagesSchema = CursorSchema.extend({
    items: z.array(ProductImageSchema),
});

export const ReviewStatusSchema = z.object({
    has_purchased: z.boolean(),
    has_reviewed: z.boolean(),
});

export type SearchCategory = z.infer<typeof SearchCategorySchema>;
export type SearchCollection = z.infer<typeof SearchCollectionSchema>;
export type SearchVariant = z.infer<typeof SearchVariantSchema>;
export type DBCatalog = z.infer<typeof DBCatalogSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductLite = z.infer<typeof ProductLiteSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type PaginatedProductSearch = z.infer<typeof PaginatedProductSearchSchema>;
export type ProductFeed = z.infer<typeof ProductFeedSchema>;
export type Facet = z.infer<typeof FacetSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type Collection = z.infer<typeof CollectionSchema>;

export type WishItem = z.infer<typeof WishItemSchema>;
export type Wishlist = z.infer<typeof WishlistSchema>;

export type ProductImage = z.infer<typeof ProductImageSchema>;
export type PaginatedProductImages = z.infer<typeof PaginatedProductImagesSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductVariantLite = z.infer<typeof ProductVariantLiteSchema>;

export type Catalog = z.infer<typeof CatalogSchema>;
export type SearchCatalog = z.infer<typeof SearchCatalogSchema>;
export type PaginatedCatalog = z.infer<typeof PaginatedCatalogSchema>;

export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
