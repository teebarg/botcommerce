import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { PaginatedReview } from "@/schemas";

export const UserSearchSchema = z.object({
    product_id: z.number().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
});

const ReviewsParamsSchema = z.object({
    product_id: z.number().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
}).partial(); // Make all fields optional for convenience in validation

export const getReviewsFn = createServerFn({ method: "GET" })
    .inputValidator(ReviewsParamsSchema)
    .handler(async ({ data: params }) => {
        return await api.get<PaginatedReview>("/reviews/", { params });
    });
