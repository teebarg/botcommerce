import { z } from "zod";

import {
    ProductSchema,
    PaginatedProductSchema,
    UserSchema,
    WishlistSchema,
    WishItemSchema,
    TokenSchema,
    FacetSchema,
    PaginatedCategorySchema,
    CategorySchema,
    PaginatedCollectionSchema,
    CollectionSchema,
    ReviewSchema,
    PaginatedReviewSchema,
    SessionSchema,
    BrandSchema,
    PaginatedBrandSchema,
    PagSchema,
} from "./schema";

export type Facet = z.infer<typeof FacetSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type PaginatedBrand = z.infer<typeof PaginatedBrandSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type PaginatedCollection = z.infer<typeof PaginatedCollectionSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type PaginatedCategory = z.infer<typeof PaginatedCategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;
export type User = z.infer<typeof UserSchema>;
export type Wishlist = z.infer<typeof WishlistSchema>;
export type WishItem = z.infer<typeof WishItemSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type PaginatedReview = z.infer<typeof PaginatedReviewSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Pag = z.infer<typeof PagSchema>;
// export type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;
