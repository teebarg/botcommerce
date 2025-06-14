import { api } from "./base";

import { Message, PaginatedReview, Review } from "@/schemas";
import { revalidate } from "@/actions/revalidate";
import { ApiResult } from "@/lib/try-catch";

// Review API methods
export const reviewsApi = {
    async all({ page = 1, limit = 20 }: { review_id?: number; page: number; limit: number }): ApiResult<PaginatedReview> {
        return await api.get<PaginatedReview>("/reviews/", { params: { page, limit }, next: { tags: ["reviews"] } });
    },
    async update(id: number, input: { rating?: number; comment?: string; verified?: boolean }): ApiResult<Review> {
        const response = await api.patch<Review>(`/reviews/${id}`, input);

        if (!response.error) {
            revalidate("reviews");
        }

        return response;
    },
    async delete(id: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/reviews/${id}`);

        if (!response.error) {
            revalidate("reviews");
        }

        return response;
    },
};
