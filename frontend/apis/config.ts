import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { Message, PaginatedSiteConfig, SiteConfig } from "@/types/models";
import { revalidate } from "@/actions/revalidate";

// Config API methods
export const configApi = {
    async all(input?: { search?: string; skip?: number; limit?: number }): Promise<PaginatedSiteConfig | null> {
        const searchParams = { search: input?.search || "", skip: input?.skip || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/`, searchParams);

        try {
            const response = await fetcher<PaginatedSiteConfig>(url);

            return response;
        } catch (error) {
            return null;
        }
    },
    async create(input: { name: string; is_active: boolean }): Promise<SiteConfig | Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/`;

        try {
            const response = await fetcher<SiteConfig>(url, { method: "POST", body: JSON.stringify(input) });

            revalidate("configs");

            return response;
        } catch (error) {
            return { message: (error as Error).message || "An error occurred", error: true };
        }
    },
    async update(id: string, input: { name: string; is_active: boolean }): Promise<SiteConfig | Message> {
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
            await fetcher<{ message: string }>(url, { method: "DELETE" });

            revalidate("configs");

            return { error: true, message: "Config deleted successfully" };
        } catch (error) {
            return { error: true, message: error instanceof Error ? error.message : "An error occurred" };
        }
    },
};
