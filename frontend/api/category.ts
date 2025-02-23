import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedCategory, Category } from "@/lib/models";

// Product API methods
export const categoryApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): Promise<PaginatedCategory> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`, searchParams);
        const response = await fetcher<PaginatedCategory>(url);

        return response;
    },
    async get(id: string): Promise<Category> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;
        const response = await fetcher<Category>(url);

        return response;
    },
    async create(input: Category): Promise<Category> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`;
        const response = await fetcher<Category>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: string, input: Category): Promise<Category> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;
        const response = await fetcher<Category>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: number): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;

        await fetcher<Category>(url, { method: "DELETE" });

        return { success: true, message: "Category deleted successfully" };
    },
};
