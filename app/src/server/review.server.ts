import { api } from "@/utils/api.server";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { PaginatedReview } from "@/schemas";

const ReviewsParamsSchema = z.object({
    product_id: z.number().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
}).partial();

export const getReviewsFn = createServerFn({ method: "GET" })
    .inputValidator(ReviewsParamsSchema)
    .handler(async ({ data: params }) => await api.get<PaginatedReview>("/reviews/", { params }));
