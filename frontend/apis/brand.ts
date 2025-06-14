import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/utils";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { Brand, PaginatedBrand } from "@/schemas/product";
import { Message } from "@/schemas";

// Brand API methods
export const brandApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): Promise<PaginatedBrand | null> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/`, searchParams);

        try {
            const response = await fetcher<PaginatedBrand>(url, { next: { tags: ["brands"] } });

            return response;
        } catch (error) {
            return null;
        }
    },
    async get(id: string): Promise<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;
        const response = await fetcher<Brand>(url);

        return response;
    },
    async create(input: { name: string; is_active: boolean }): ApiResult<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/`;

        const response = await tryCatch<Brand>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("brands");
        }

        return response;
    },
    async update(id: string, input: { name: string; is_active: boolean }): ApiResult<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;
        const response = await tryCatch<Brand>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("brands");
        }

        return response;
    },
    async delete(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;

        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("brands");
        }

        return response;
    },
};
