import { api } from "./base";

import { Message, ShopSettings } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult } from "@/lib/try-catch";

export const shopSettingsApi = {
    async all(input?: { type?: string; category?: string; is_public?: boolean; skip?: number; limit?: number }): ApiResult<ShopSettings[]> {
        const searchParams = {
            type: input?.type || "",
            category: input?.category || "",
            is_public: input?.is_public?.toString() || "",
            skip: input?.skip || 0,
            limit: input?.limit || 20,
        };

        return await api.get<ShopSettings[]>("/shop-settings/", { params: searchParams, next: { tags: ["settings"] } });
    },

    async create(input: {
        key: string;
        value: string;
        type: string;
        category?: string;
        description?: string;
        is_public?: boolean;
    }): ApiResult<ShopSettings> {
        const response = await api.post<ShopSettings>("/shop-settings/", input);

        if (!response.error) {
            revalidate("settings");
        }

        return response;
    },

    async update(
        id: number,
        input: {
            key?: string;
            value?: string;
            type?: string;
            category?: string;
            description?: string;
            is_public?: boolean;
        }
    ): ApiResult<ShopSettings> {
        const response = await api.patch<ShopSettings>(`/shop-settings/${id}`, input);

        if (!response.error) {
            revalidate("settings");
        }

        return response;
    },

    async delete(id: string): ApiResult<Message> {
        const response = await api.delete<Message>(`/shop-settings/${id}`);

        if (!response.error) {
            revalidate("settings");
        }

        return response;
    },

    async getPublicSettings(): ApiResult<Record<string, string>> {
        const res = await api.get<Record<string, string>>("/shop-settings/public", { next: { tags: ["settings"] } });

        return res;
    },
    async syncShopDetails(input: Record<string, string>): ApiResult<ShopSettings> {
        const response = await api.patch<ShopSettings>(`/shop-settings/sync-shop-details`, input);

        if (!response.error) {
            revalidate("settings");
        }

        return response;
    },
};
