import { queryOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ContactFormValues } from "@/components/store/contact-form";
import { getShopSettingsPublicFn } from "@/server/generic.server";
import { Message, ShopSettings } from "@/schemas";
import { clientApi } from "@/utils/api.client";

export const siteConfigQueryOptions = () =>
    queryOptions({
        queryKey: ["shop-settings", "public"],
        queryFn: () => getShopSettingsPublicFn(),
        staleTime: 1000 * 60 * 60 * 24 * 7,
    });

export const useSyncShopDetails = () => {
    return useMutation({
        mutationFn: async (input: Record<string, string>) => await clientApi.patch<ShopSettings>("/shop-settings/sync-shop-details", input),
        onSuccess: () => {
            toast.success("Shop details synced successfully");
        },
        onError: (error) => {
            toast.error("Failed to sync shop details" + error.message);
        },
    });
};

export const useSubscribeNewsletter = () => {
    return useMutation({
        mutationFn: async (data: { email: string }) => await clientApi.post<Message>(`/newsletter`, data),
        onSuccess: () => {
            toast.success("Successfully subscribed to newsletter");
        },
        onError: (error) => {
            toast.error("Failed to subscribe to newsletter" + error);
        },
    });
};

export const useContactForm = () => {
    return useMutation({
        mutationFn: async (data: ContactFormValues) => await clientApi.post<Message>("/contact-form", data),
        onSuccess: () => {
            toast.success("Successfully sent message");
        },
        onError: (error) => {
            toast.error("Failed to send message" + error);
        },
    });
};
