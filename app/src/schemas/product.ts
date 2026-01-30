import { z } from "zod";

import { ProductStatusSchema } from "./enums";
import { ReviewSchema } from "./review";
import { AuditSchema } from "./base";
import { PagSchema } from "./common";

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

export const PaginatedCategorySchema = PagSchema.extend({
    categories: z.array(CategorySchema),
});

export const CollectionSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        is_active: z.boolean(),
        products: z.null(),
    })
    .merge(AuditSchema);

export const PaginatedCollectionSchema = PagSchema.extend({
    collections: z.array(CollectionSchema),
});

export const ProductImageSchema = z
    .object({
        id: z.number(),
        product_id: z.number().optional(),
        image: z.string(),
        order: z.number(),
    })
    .merge(AuditSchema);

export const ProductVariantSchema: z.ZodType<any> = z.lazy(() =>
    z
        .object({
            id: z.number(),
            product_id: z.number(),
            sku: z.string(),
            status: ProductStatusSchema,
            price: z.number(),
            old_price: z.number().nullable().optional(),
            inventory: z.number(),
            size: z.string().nullable().optional(),
            color: z.string().nullable().optional(),
            measurement: z.number().nullable().optional(),
            age: z.string().nullable().optional(),
            order_items: z.null(),
            cart_items: z.null(),

            // Bidirectional
            product: ProductSchema.optional(),
        })
        .merge(AuditSchema)
);

export const ProductSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        sku: z.string(),
        description: z.string(),
        image: z.string(),
        variants: z.array(ProductVariantSchema).optional(),
        ratings: z.number(),
        categories: z.array(CategorySchema),
        collections: z.array(CollectionSchema),
        tags: z.null(),
        images: z.array(ProductImageSchema),
        reviews: z.array(ReviewSchema),
        favorites: z.null(),
        active: z.boolean(),
        is_new: z.boolean(),
    })
    .merge(AuditSchema);

export const SearchVariantSchema = z.object({
    id: z.number(),
    sku: z.string(),
    status: ProductStatusSchema,
    price: z.number(),
    old_price: z.number().nullable().optional(),
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
    category_slugs: z.array(z.string()),
    collections: z.array(SearchCollectionSchema),
    collection_slugs: z.array(z.string()),
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

export const SharedSchema = z
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

export const PaginatedSharedSchema = PagSchema.extend({
    shared: z.array(SharedSchema),
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

export const CatalogSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    view_count: z.number(),
    is_active: z.boolean(),
    products: z.array(ProductSearchSchema),
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

export const GalleryProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    image: z.string(),
    variants: z.array(ProductVariantSchema).optional(),
    ratings: z.number(),
    categories: z.array(CategorySchema),
    collections: z.array(CollectionSchema),
    images: z.array(ProductImageSchema),
    reviews: z.array(ReviewSchema),
    active: z.boolean(),
    product_id: z.number().optional(),
    status: ProductStatusSchema,
    shared_collections: z.array(DBCatalogSchema),
    is_new: z.boolean().optional(),
});

export const GalleryImageItemSchema = z.object({
    id: z.number(),
    image: z.string(),
    product: GalleryProductSchema.optional(),
    product_id: z.number().optional(),
});

export const GalleryImageSchema = z.object({
    images: z.array(GalleryImageItemSchema),
    next_cursor: z.number().optional(),
});

export type GalleryProduct = z.infer<typeof GalleryProductSchema>;
export type GalleryImageItem = z.infer<typeof GalleryImageItemSchema>;
export type GalleryImage = z.infer<typeof GalleryImageSchema>;

export type SearchCategory = z.infer<typeof SearchCategorySchema>;
export type SearchCollection = z.infer<typeof SearchCollectionSchema>;
export type SearchVariant = z.infer<typeof SearchVariantSchema>;
export type DBCatalog = z.infer<typeof DBCatalogSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type PaginatedProductSearch = z.infer<typeof PaginatedProductSearchSchema>;
export type ProductFeed = z.infer<typeof ProductFeedSchema>;
export type Facet = z.infer<typeof FacetSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type PaginatedCategory = z.infer<typeof PaginatedCategorySchema>;

export type Collection = z.infer<typeof CollectionSchema>;
export type PaginatedCollection = z.infer<typeof PaginatedCollectionSchema>;

export type WishItem = z.infer<typeof WishItemSchema>;
export type Wishlist = z.infer<typeof WishlistSchema>;

export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export type Shared = z.infer<typeof SharedSchema>;
export type PaginatedShared = z.infer<typeof PaginatedSharedSchema>;

export type Catalog = z.infer<typeof CatalogSchema>;
