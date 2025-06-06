import { fetcher } from "./fetcher";
import { api } from "./base";

import { buildUrl } from "@/lib/utils";
import { PaginatedCollection, Collection, Message } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Collection API methods
export const collectionApi = {
    async getAll(search?: string): ApiResult<Collection[]> {
        return await api.get<Collection[]>("/collection/all", { params: { search: search || "" }, next: { tags: ["collections"] } });
    },
    async all(input?: { search?: string; page?: number; limit?: number }): ApiResult<PaginatedCollection> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/`, searchParams);

        const response = await tryCatch<PaginatedCollection>(fetcher(url, { next: { tags: ["collections"] } }));

        return response;
    },
    async get(id: string): ApiResult<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;
        const response = await tryCatch<Collection>(fetcher(url));

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
    async delete(id: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/collection/${id}`);

        if (!response.error) {
            revalidate("collections");
        }

        return response;
    },
};
