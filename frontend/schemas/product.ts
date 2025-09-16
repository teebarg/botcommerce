import { z } from "zod";

import { ProductStatusSchema } from "./enums";
import { ReviewSchema } from "./review";
import { AuditSchema } from "./base";
import { PagSchema } from "./common";

export const BrandSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        is_active: z.boolean(),
        products: z.null(),
    })
    .merge(AuditSchema);

export const PaginatedBrandSchema = PagSchema.extend({
    brands: z.array(BrandSchema),
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
    })
    .merge(AuditSchema);

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
    variants: z.array(ProductVariantSchema).nullable(),
    ratings: z.number(),
    categories: z.array(CategorySchema),
    category_slugs: z.array(z.string()),
    collections: z.array(CollectionSchema),
    collection_slugs: z.array(z.string()),
    tags: z.null(),
    images: z.array(ProductImageSchema),
    sorted_images: z.array(z.string()),
    reviews: z.array(z.any()).nullable(),
    favorites: z.null(),
    average_rating: z.number(),
    review_count: z.number(),
    max_variant_price: z.number(),
    min_variant_price: z.number(),
    active: z.boolean(),
    sizes: z.array(z.string()),
    colors: z.array(z.string()),
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
    category_slugs: z.record(z.string()).optional(),
    collection_slugs: z.record(z.string()).optional(),
    sizes: z.record(z.string()).optional(),
    colors: z.record(z.string()).optional(),
});

export const PaginatedProductSearchSchema = PagSchema.extend({
    products: z.array(ProductSearchSchema),
    facets: FacetSchema.optional(),
    suggestions: z.array(z.string()),
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
    is_active: z.boolean(),
});

export const SearchImageItemSchema = z.object({
    id: z.number(),
    product_id: z.number().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    image: z.string(),
    active: z.boolean(),
    status: ProductStatusSchema,
    categories: z.array(CategorySchema),
    collections: z.array(CollectionSchema),
    variants: z.array(ProductVariantSchema).optional(),
    catalogs: z.array(z.string()),
});

export const SearchImageSchema = z.object({
    images: z.array(SearchImageItemSchema),
    skip: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
});


export type DBCatalog = z.infer<typeof DBCatalogSchema>;
export type SearchImageItem = z.infer<typeof SearchImageItemSchema>;
export type SearchImage = z.infer<typeof SearchImageSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type PaginatedProductSearch = z.infer<typeof PaginatedProductSearchSchema>;
export type Facet = z.infer<typeof FacetSchema>;

export type Brand = z.infer<typeof BrandSchema>;
export type PaginatedBrand = z.infer<typeof PaginatedBrandSchema>;

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
