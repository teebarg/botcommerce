import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedBrand, Brand } from "@/lib/models";

// Brand API methods
export const brandApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): Promise<PaginatedBrand | null> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/`, searchParams);
        try {
            const response = await fetcher<PaginatedBrand>(url);
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
    async getBySlug(slug: string): Promise<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/slug/${slug}`;
        const response = await fetcher<Brand>(url);

        return response;
    },
    async create(input: Brand): Promise<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/`;
        const response = await fetcher<Brand>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: string, input: Brand): Promise<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;
        const response = await fetcher<Brand>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;

        await fetcher<Brand>(url, { method: "DELETE" });

        return { success: true, message: "Brand deleted successfully" };
    },
};
