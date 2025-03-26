import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { Message, PaginatedReview, Review } from "@/types/models";
import { revalidate } from "@/actions/revalidate";

// Review API methods
export const reviewsApi = {
    async all({ page = 1, limit = 20 }: { review_id?: number; page: number; limit: number }): Promise<PaginatedReview> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`, { page, limit });
        const response = await fetcher<PaginatedReview>(url);

        return response;
    },
    async update(id: string, input: { verified: boolean; rating: number; comment: string }): Promise<Review | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/${id}`;

        try {
            const response = await fetcher<Review>(url, { method: "PATCH", body: JSON.stringify(input) });

            revalidate("reviews");

            return response;
        } catch (error) {
            return { message: (error as Error).message || "An error occurred", error: true };
        }
    },
    async delete(id: string): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/${id}`;

        try {
            await fetcher<Review>(url, { method: "DELETE" });

            revalidate("reviews");

            return { error: false, message: "Review deleted successfully" };
        } catch (error) {
            return { message: (error as Error).message || "An error occurred", error: true };
        }
    },
};
