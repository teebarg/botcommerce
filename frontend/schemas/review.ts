import { z } from "zod";

import { UserSchema } from "./user";
import { AuditSchema } from "./base";

const RatingSchema = z.object({
    average: z.number().optional(),
    count: z.number(),
    breakdown: z.any(),
});


const PagSchema = z.object({
    skip: z.number().optional(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
    ratings: RatingSchema,
});

export const ReviewSchema = z
    .object({
        id: z.number(),
        author: z.string(),
        title: z.string().optional(),
        rating: z.number(),
        comment: z.string(),
        verified: z.boolean().optional(),
        product_id: z.number(),
        user: UserSchema,
    })
    .merge(AuditSchema);

export const PaginatedReviewSchema = PagSchema.extend({
    reviews: z.array(ReviewSchema),
});

export type Review = z.infer<typeof ReviewSchema>;
export type PaginatedReview = z.infer<typeof PaginatedReviewSchema>;
