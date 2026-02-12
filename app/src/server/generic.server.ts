import { z } from "zod";
import type { ContactFormValues } from "@/components/store/contact-form";
import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/fetch-api";
import {
    type ChatMessage,
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
    return await api.get<Record<string, string>>("/shop-settings/public");
});

export const syncShopDetailsFn = createServerFn({ method: "POST" })
    .inputValidator(z.record(z.string(), z.string()))
    .handler(async ({ data }) => {
        return await api.patch<ShopSettings>("/shop-settings/sync-shop-details", data);
    });

export const subscribeNewsletterFn = createServerFn({ method: "POST" })
    .inputValidator(z.object({ email: z.string().email() }))
    .handler(async ({ data }) => {
        return await api.post<Message>(`/newsletter`, data);
    });

export const contactFormFn = createServerFn({ method: "POST" })
    .inputValidator(z.custom<ContactFormValues>())
    .handler(async ({ data }) => {
        return await api.post<Message>(`/contact-form`, data);
    });

const ConversationParamsSchema = z
    .object({
        user_id: z.number().optional(),
        status: z.custom<ConversationStatus>().optional(),
        skip: z.number().optional(),
        limit: z.number().optional(),
    })
    .optional();

export const getBankDetailsFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<BankDetails[]>("/bank-details/");
});

const BankDetailsSchema = z.object({
    bank_name: z.string(),
    account_name: z.string(),
    account_number: z.string(),
});

export const createBankDetailsFn = createServerFn({ method: "POST" })
    .inputValidator(BankDetailsSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>("/bank-details/", data);
    });

export const deleteBankDetailsFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/bank-details/${id}`);
    });

const ChatInputSchema = z.object({
    user_id: z.number().nullable().optional(),
    conversation_uuid: z.string().nullable().optional(),
    user_message: z.string(),
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

export const getChatFn = createServerFn({ method: "GET" })
    .inputValidator((data: string) => data)
    .handler(async ({ data: id }) => {
        return await api.get<{ messages: ChatMessage[] }>(`/chat/${id}`);
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

const UserInteractionSchema = z.object({
    user_id: z.number(),
    product_id: z.number(),
    type: z.enum(["VIEW", "PURCHASE", "CART_ADD", "WISHLIST_ADD", "WISHLIST_REMOVE"]).optional(),
    metadata: z.record(z.string(), z.string()).optional(),
});

const BatchUserInteractionSchema = z.array(UserInteractionSchema);

// interactions fn
export const sendUserInteractionsFn = createServerFn({ method: "POST" })
    .inputValidator(BatchUserInteractionSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>("/user-interactions/batch", data);
    });

export const bulkRequestFn = createServerFn({ method: "POST" })
    .inputValidator((d: any) => d)
    .handler(async ({ data }) => {
        return await api.post<Message>("/bulk-purchase", data);
    });

export const createErrorFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            message: z.string(),
            scenario: z.string().optional(),
            stack: z.string().optional(),
        })
    )
    .handler(async ({ data }) => {
        return await api.post<Message>("/log-error", data);
    });
