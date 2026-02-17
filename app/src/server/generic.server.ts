import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/fetch-api";
import { type ChatMessage, type ConversationStatus, type DeliveryOption, type PaginatedChat, type ShopSettings } from "@/schemas";

export const getShopSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<ShopSettings[]>("/shop-settings/");
});

export const getShopSettingsPublicFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Record<string, string>>("/shop-settings/public");
});

const ConversationParamsSchema = z
    .object({
        user_id: z.number().optional(),
        status: z.custom<ConversationStatus>().optional(),
        skip: z.number().optional(),
        limit: z.number().optional(),
    })
    .optional();

export const getChatsFn = createServerFn({ method: "GET" })
    .inputValidator(ConversationParamsSchema)
    .handler(async ({ data }) => {
        return await api.get<PaginatedChat>("/chat/", { params: data });
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
