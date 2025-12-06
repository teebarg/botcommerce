import { z } from "zod";
import type { ContactFormValues } from "@/components/store/contact-form";
import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/fetch-api";
import {
    ShippingMethodSchema,
    type BankDetails,
    type ConversationStatus,
    type DeliveryOption,
    type Message,
    type PaginatedChat,
    type ShopSettings,
} from "@/schemas";

export const getShopSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<ShopSettings[]>("/shop-settings/");
});

export const getShopSettingsPublicFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Record<string, string | number>>("/shop-settings/public");
});

export const syncShopDetailsFn = createServerFn({ method: "POST" })
    .inputValidator(z.record(z.string(), z.string())) // Validates Record<string, string>
    .handler(async ({ data }) => {
        return await api.patch<ShopSettings>("/shop-settings/sync-shop-details", data);
    });

export const subscribeNewsletterFn = createServerFn({ method: "POST" })
    .inputValidator(z.object({ email: z.email() }))
    .handler(async ({ data }) => {
        return await api.post<Message>(`/newsletter`, data);
    });

export const contactFormFn = createServerFn({ method: "POST" })
    // Using z.custom here since the specific Zod schema for ContactFormValues wasn't provided,
    // but you can replace this with your actual Zod schema object if you have it.
    .inputValidator(z.custom<ContactFormValues>())
    .handler(async ({ data }) => {
        return await api.post<Message>(`/contact-form`, data);
    });

// Assuming getStatsTrendsFn is defined and imported elsewhere, as per original file:
// import { getStatsTrendsFn } from "@/server/admin.server";

// --- Zod Schemas for Validation ---

const ConversationParamsSchema = z
    .object({
        user_id: z.number().optional(),
        // Assuming ConversationStatus is a string type defined in your schemas
        status: z.custom<ConversationStatus>().optional(),
        skip: z.number().optional(),
        limit: z.number().optional(),
    })
    .optional();

const ChatInputSchema = z.object({
    user_id: z.number().nullable().optional(), // Nullable since session might be missing
    conversation_uuid: z.string().optional(),
    user_message: z.string(),
});

export const getBankDetailsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<BankDetails[]>("/bank-details/");
});

export const chatMutationFn = createServerFn({ method: "POST" })
    .inputValidator(ChatInputSchema)
    .handler(async ({ data }) => {
        return await api.post<{ reply: string; conversation_uuid: string }>("/chat/", data);
    });

export const getChatsFn = createServerFn({ method: "GET" })
    .inputValidator(ConversationParamsSchema)
    .handler(async ({ data }) => {
        return await api.get<PaginatedChat>("/chat/", { params: data });
    });

export const deleteChatFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/chat/${id}`);
    });

export const getDeliveryOptionsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<DeliveryOption[]>("/delivery/available");
});

export const getAdminDeliveryOptionsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<DeliveryOption[]>("/delivery/");
});

const DeliverySchema = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    method: ShippingMethodSchema,
    amount: z.number().min(0, "Amount must be greater than or equal to 0"),
    duration: z.string().min(1, "Duration is required"),
    is_active: z.boolean().default(true),
});

export const createDeliveryFn = createServerFn({ method: "POST" })
    .inputValidator(DeliverySchema)
    .handler(async ({ data }) => {
        return await api.post<DeliveryOption>("/delivery/", data);
    });

export const updateDeliveryFn = createServerFn({ method: "POST" })
    .inputValidator(DeliverySchema)
    .handler(async ({ data }) => {
        const { id, ...rest } = data;
        return await api.patch<DeliveryOption>(`/delivery/${id}`, rest);
    });

export const deleteDeliveryFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/delivery/${id}`);
    });

const FCMSchema = z.object({
    endpoint: z.string(),
    p256dh: z.string(),
    auth: z.string(),
});

export const sendFCMFn = createServerFn({ method: "POST" })
    .inputValidator(FCMSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>("/notification/push-fcm", data);
    });
