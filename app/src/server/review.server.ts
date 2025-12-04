import { serverApi } from "@/apis/server-client";
import { PaginatedReview } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const UserSearchSchema = z.object({
    product_id: z.number().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
});

export const getProductReviewFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => UserSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await serverApi.get<PaginatedReview>("/reviews/", { params: { ...data } });
        return res;
    });
