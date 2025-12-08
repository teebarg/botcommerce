import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ContactFormValues } from "@/components/store/contact-form";
import { contactFormFn, getShopSettingsPublicFn, subscribeNewsletterFn, syncShopDetailsFn } from "@/server/generic.server";

export const siteConfigQuery = queryOptions({
    queryKey: ["shop-settings", "public"],
    queryFn: () => getShopSettingsPublicFn(),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7days
});

export const useShopSettingsPublic = () => {
    return useQuery({
        queryKey: ["shop-settings", "public"],
        queryFn: () => getShopSettingsPublicFn(),
    });
};

export const useSyncShopDetails = () => {
    return useMutation({
        mutationFn: async (input: Record<string, string>) => await syncShopDetailsFn({ data: input }),
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
        mutationFn: async (data: { email: string }) => await subscribeNewsletterFn({ data }),
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
        mutationFn: async (data: ContactFormValues) => await contactFormFn({ data }),
        onSuccess: () => {
            toast.success("Successfully sent message");
        },
        onError: (error) => {
            toast.error("Failed to send message" + error);
        },
    });
};
