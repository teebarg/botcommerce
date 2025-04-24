import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedCategory, Category, Message } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Product API methods
export const categoryApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): ApiResult<PaginatedCategory> {
        const searchParams = { query: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`, searchParams);

        return await tryCatch<PaginatedCategory>(fetcher(url, { next: { tags: ["categories"] } }));
    },
    async get(id: string): ApiResult<Category> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;

        return await tryCatch<Category>(fetcher(url));
    },
    async create(input: any): ApiResult<Category> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`;

        return await tryCatch<Category>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));
    },
    async update(id: number, input: any): ApiResult<Category> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;

        return await tryCatch<Category>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));
    },
    async delete(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;
        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("categories");
        }

        return response;
    },
    async uploadImage({ id, data }: { id: number; data: any }): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}/image`;

        const response = await tryCatch<Message>(fetcher(url, { method: "PATCH", body: JSON.stringify(data) }));

        if (!response.error) {
            revalidate("products");
            revalidate("search");
            revalidate("categories");
        }

        return response;
    },
    async deleteImage(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}/image`;

        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("products");
            revalidate("search");
            revalidate("categories");
        }

        return response;
    },
};
