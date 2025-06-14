import { api } from "./base";

import { ApiResult } from "@/lib/try-catch";
import { Category, Message } from "@/schemas";

// Product API methods
export const categoryApi = {
    async create(input: any): ApiResult<Category> {
        return await api.post<Category>("/category", input);
    },
    async update(id: number, input: any): ApiResult<Category> {
        return await api.patch<Category>(`/category/${id}`, input);
    },
    async delete(id: number): ApiResult<Message> {
        return await api.delete<Message>(`/category/${id}`);
    },
    async uploadImage({ id, data }: { id: number; data: any }): ApiResult<Message> {
        return await api.patch<Message>(`/category/${id}/image`, data);
    },
    async deleteImage(id: number): ApiResult<Message> {
        return await api.delete<Message>(`/category/${id}/image`);
    },
};
