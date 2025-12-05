import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Message, PaginatedReview, Review } from "@/schemas";


// --- Zod Schemas for Validation ---
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

const CreateReviewInputSchema = z.object({
    product_id: z.number(),
    author: z.string(),
    title: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string(),
});

const UpdateReviewInputSchema = z.object({
    id: z.number(),
    input: z.object({
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
        verified: z.boolean().optional(),
    }),
});

const ReviewIdSchema = z.number();

// --- Server Functions ---
export const getProductReviewFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => UserSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await api.get<PaginatedReview>("/reviews/", { params: { ...data } });
        return res;
    });

export const getReviewsFn = createServerFn({ method: "GET" })
    .inputValidator(ReviewsParamsSchema)
    .handler(async ({ data: params }) => {
        return await api.get<PaginatedReview>("/reviews/", { params });
    });

export const createReviewFn = createServerFn({ method: "POST" })
    .inputValidator(CreateReviewInputSchema)
    .handler(async ({ data: input }) => {
        // API endpoint is /reviews/
        return await api.post<Review>(`/reviews/`, input);
    });

export const updateReviewFn = createServerFn({ method: "POST" }) // RPC uses POST, API uses PATCH
    .inputValidator(UpdateReviewInputSchema)
    .handler(async ({ data: { id, input } }) => {
        // Internal API call uses PATCH
        return await api.patch<Review>(`/reviews/${id}`, input);
    });


export const deleteReviewFn = createServerFn({ method: "POST" }) // RPC uses POST, API uses DELETE
    .inputValidator(ReviewIdSchema)
    .handler(async ({ data: id }) => {
        // Internal API call uses DELETE
        return await api.delete<Message>(`/reviews/${id}`);
    });
