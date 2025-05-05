import { fetcher } from "./fetcher";

import { Category, Message } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Product API methods
export const categoryApi = {
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
            revalidate("categories");
        }

        return response;
    },
    async deleteImage(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}/image`;

        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("categories");
        }

        return response;
    },
};
