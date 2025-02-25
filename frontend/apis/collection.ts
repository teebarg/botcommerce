import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedCollection, Collection } from "@/lib/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Collection API methods
export const collectionApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): Promise<PaginatedCollection | null> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/`, searchParams);

        try {
            const response = await fetcher<PaginatedCollection>(url, { next: { tags: ["collections"] } });

            return response;
        } catch (error) {
            return null;
        }
    },
    async get(id: string): Promise<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;
        const response = await fetcher<Collection>(url);

        return response;
    },
    async getBySlug(slug: string): ApiResult<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/slug/${slug}`;
        const response = await tryCatch<Collection>(fetcher(url));

        return response;
    },
    async create(input: { name: string; is_active: boolean }): ApiResult<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/`;
        const response = await tryCatch<Collection>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("collections");
        }

        return response;
    },
    async update(id: string, input: { name: string; is_active: boolean }): ApiResult<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;
        const response = await tryCatch<Collection>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("collections");
        }

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;

        await fetcher<Collection>(url, { method: "DELETE" });

        revalidate("collections");

        return { success: true, message: "Collection deleted successfully" };
    },
};
