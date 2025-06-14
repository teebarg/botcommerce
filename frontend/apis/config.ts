import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/utils";
import { Message, PaginatedSiteConfig, SiteConfig } from "@/schemas";
import { revalidate } from "@/actions/revalidate";

// Config API methods
export const configApi = {
    async all(input?: { search?: string; skip?: number; limit?: number }): Promise<PaginatedSiteConfig | null> {
        const searchParams = { search: input?.search || "", skip: input?.skip || 0, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/`, searchParams);

        try {
            const response = await fetcher<PaginatedSiteConfig>(url);

            return response;
        } catch (error) {
            return null;
        }
    },
    async create(input: { key: string; value: string }): Promise<SiteConfig | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/`;

        try {
            const response = await fetcher<SiteConfig>(url, { method: "POST", body: JSON.stringify(input) });

            revalidate("configs");

            return response;
        } catch (error) {
            return { message: (error as Error).message || "An error occurred", error: true };
        }
    },
    async update(id: string, input: { key: string; value: string }): Promise<SiteConfig | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/${id}`;

        try {
            const response = await fetcher<SiteConfig>(url, { method: "PATCH", body: JSON.stringify(input) });

            revalidate("configs");

            return response;
        } catch (error) {
            return { message: (error as Error).message || "An error occurred", error: true };
        }
    },
    async delete(id: string): Promise<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/${id}`;

        try {
            await fetcher(url, { method: "DELETE" });
            revalidate("configs");

            return { message: "Config deleted successfully", error: false };
        } catch (error) {
            return { message: (error as Error).message || "An error occurred", error: true };
        }
    },
};
