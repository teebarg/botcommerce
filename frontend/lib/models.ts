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
} from "./schema";

export type Facet = z.infer<typeof FacetSchema>;
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
// export type PaginatedProduct = z.infer<typeof PaginatedProductSchema>;
