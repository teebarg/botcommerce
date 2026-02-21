import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/api.server";
import { ConversationStatusSchema, type ChatMessage, type DeliveryOption, type PaginatedChats, type ShopSettings } from "@/schemas";
import { StatsTrends } from "@/types/models";

export const getStatTrendsFn = createServerFn().handler(async () => await api.get<StatsTrends>("/stats/trends"));

export const getShopSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<ShopSettings[]>("/shop-settings/");
});

export const getShopSettingsPublicFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Record<string, string>>("/shop-settings/public");
});

export const getChatsFn = createServerFn({ method: "GET" })
    .inputValidator(
        z
            .object({
                user_id: z.number().optional(),
                status: ConversationStatusSchema.optional(),
            })
            .optional()
    )
    .handler(async ({ data }) => {
        return await api.get<PaginatedChats>("/chat/", { params: data });
    });

export const getChatFn = createServerFn({ method: "GET" })
    .inputValidator((data: string) => data)
    .handler(async ({ data: id }) => {
        return await api.get<{ messages: ChatMessage[] }>(`/chat/${id}`);
    });

export const getDeliveryOptionsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<DeliveryOption[]>("/delivery/available");
});

export const getAdminDeliveryOptionsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<DeliveryOption[]>("/delivery/");
});
