import { z } from "zod";
import { UserSchema } from "./user";
import { CursorSchema } from "./common";

const RatingSchema = z.object({
    average: z.number().optional(),
    count: z.number(),
    breakdown: z.any(),
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
        created_at: z.string(),
    });

export const PaginatedReviewSchema = CursorSchema.extend({
    items: z.array(ReviewSchema),
    ratings: RatingSchema,
});

export type Review = z.infer<typeof ReviewSchema>;
export type PaginatedReview = z.infer<typeof PaginatedReviewSchema>;
