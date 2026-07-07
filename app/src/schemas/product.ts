import { z } from "zod";

import { ProductStatusSchema } from "./enums";
import { CursorSchema } from "./common";
import { booleanParam } from "./search-schemas";

const PagSchema = z.object({
    skip: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});

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
    });

export const CollectionSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        is_active: z.boolean(),
        created_at: z.string().optional()
    });

export const ProductVariantLiteSchema = z.object({
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
});

export const ProductImageLiteSchema = z.object({
    id: z.number(),
    image: z.string(),
    order: z.number()
});

export const ProductLiteSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    images: z.array(ProductImageLiteSchema),
    variants: z.array(ProductVariantLiteSchema).optional(),
    active: z.boolean(),
    is_new: z.boolean().optional(),
});

export const ProductVariantSchema = z.object({
    id: z.number(),
    sku: z.string(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number(),
    inventory: z.number(),
    size: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    length: z.number().nullable().optional(),
    age: z.string().nullable().optional(),
});

export const ProductSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        sku: z.string(),
        description: z.string(),
        variants: z.array(ProductVariantLiteSchema).optional(),
        categories: z.array(CategorySchema),
        collections: z.array(CollectionSchema),
        active: z.boolean(),
        is_new: z.boolean(),
    });

export const ProductImageSchema = z.object({
    id: z.number(),
    image: z.string(),
    product: ProductSchema.optional(),
    product_id: z.number().optional(),
});

export const SearchVariantSchema = z.object({
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
    image: z.string(),
    status: ProductStatusSchema,
    variants: z.array(SearchVariantSchema).nullable(),
    active: z.boolean(),
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
        created_at: z.string(),
    });

export const PaginatedCatalogSchema = PagSchema.extend({
    catalogs: z.array(CatalogSchema),
});

export const PaginatedProductSearchSchema = PagSchema.extend({
    products: z.array(ProductSearchSchema),
});

export const ProductFeedSchema = z.object({
    products: z.array(ProductSearchSchema),
    feed_seed: z.number(),
    next_cursor: z.string(),
    limit: z.number(),
    total_count: z.number(),
});

export const WishItemSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    product: ProductLiteSchema,
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

export const CategoriesProductsSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    products: z.array(ProductSearchSchema),
});

export const FeedQuerySchema = z.object({
    search: z.string().optional(),
    sort: z.enum(["min_variant_price:asc", "min_variant_price:desc", "id:desc", "created_at:desc"]).optional(),
    cat_ids: z.string().optional(),
    sizes: z.string().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    min_price: z.coerce.number().optional(),
    max_price: z.coerce.number().optional(),
    collections: z.string().optional(),
    feed_seed: z.coerce.number().optional(),
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

export type SearchCategory = z.infer<typeof SearchCategorySchema>;
export type SearchCollection = z.infer<typeof SearchCollectionSchema>;
export type SearchVariant = z.infer<typeof SearchVariantSchema>;
export type DBCatalog = z.infer<typeof DBCatalogSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductLite = z.infer<typeof ProductLiteSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type PaginatedProductSearch = z.infer<typeof PaginatedProductSearchSchema>;
export type ProductFeed = z.infer<typeof ProductFeedSchema>;

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
