import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedBrand, Brand } from "@/lib/models";
import { revalidate } from "@/actions/revalidate";

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
    async create(input: { name: string; is_active: boolean }): Promise<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/`;
        const response = await fetcher<Brand>(url, { method: "POST", body: JSON.stringify(input) });

        revalidate("brands");

        return response;
    },
    async update(id: string, input: { name: string; is_active: boolean }): Promise<Brand> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;
        const response = await fetcher<Brand>(url, { method: "PATCH", body: JSON.stringify(input) });

        revalidate("brands");

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/${id}`;

        await fetcher<Brand>(url, { method: "DELETE" });
        revalidate("brands");

        return { success: true, message: "Brand deleted successfully" };
    },
};
