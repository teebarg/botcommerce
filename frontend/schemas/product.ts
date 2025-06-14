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
        product_id: z.number(),
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
        status: ProductStatusSchema,
        variants: z.array(ProductVariantSchema).optional(),
        ratings: z.number(),
        categories: z.array(CategorySchema),
        collections: z.array(CollectionSchema),
        brand: BrandSchema,
        tags: z.null(),
        images: z.array(ProductImageSchema),
        reviews: z.array(ReviewSchema),
        favorites: z.null(),
    })
    .merge(AuditSchema);

export const PaginatedProductSchema = PagSchema.extend({
    products: z.array(ProductSchema),
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
    variants: z.array(ProductVariantSchema).nullable(),
    ratings: z.number(),
    categories: z.array(z.string()),
    collections: z.array(z.string()),
    brand: z.string(),
    tags: z.null(),
    images: z.array(z.string()),
    reviews: z.array(z.any()).nullable(),
    favorites: z.null(),
    average_rating: z.number(),
    review_count: z.number(),
    max_variant_price: z.number(),
    min_variant_price: z.number(),
});

export const FacetSchema = z.object({
    brand: z.record(z.string()).optional(),
    categories: z.record(z.string()).optional(),
    collections: z.record(z.string()).optional(),
});

export const PaginatedProductSearchSchema = PagSchema.extend({
    products: z.array(ProductSearchSchema),
    facets: FacetSchema.optional(),
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

export type Product = z.infer<typeof ProductSchema>;
export type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;
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
