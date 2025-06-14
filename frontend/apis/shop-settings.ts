import { api } from "./base";

import { Message, ShopSettings } from "@/schemas";
import { revalidate } from "@/actions/revalidate";
import { ApiResult } from "@/lib/try-catch";

export const shopSettingsApi = {
    async all(): ApiResult<ShopSettings[]> {
        return await api.get<ShopSettings[]>("/shop-settings/", { next: { tags: ["settings"] } });
    },

    async create(input: { key: string; value: string; type: string }): ApiResult<ShopSettings> {
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
        return await api.get<Record<string, string>>("/shop-settings/public", { next: { tags: ["settings"] } });
    },
    async syncShopDetails(input: Record<string, string>): ApiResult<ShopSettings> {
        const response = await api.patch<ShopSettings>(`/shop-settings/sync-shop-details`, input);

        if (!response.error) {
            revalidate("settings");
        }

        return response;
    },
};
