import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedCollection, Collection } from "@/lib/models";

// Collection API methods
export const collectionApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): Promise<PaginatedCollection> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/`, searchParams);
        const response = await fetcher<PaginatedCollection>(url);

        return response;
    },
    async get(id: string): Promise<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;
        const response = await fetcher<Collection>(url);

        return response;
    },
    async getBySlug(slug: string): Promise<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/slug/${slug}`;
        const response = await fetcher<Collection>(url);

        return response;
    },
    async create(input: Collection): Promise<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/`;
        const response = await fetcher<Collection>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: string, input: Collection): Promise<Collection> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;
        const response = await fetcher<Collection>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${id}`;
        await fetcher<Collection>(url, { method: "DELETE" });

        return { success: true, message: "Collection deleted successfully" };
    },
};
