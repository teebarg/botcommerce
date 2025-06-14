import { z } from "zod";

import { UserSchema } from "./user";
import { AuditSchema } from "./base";
import { PagSchema } from "./common";

export const ReviewSchema = z
    .object({
        id: z.number(),
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
