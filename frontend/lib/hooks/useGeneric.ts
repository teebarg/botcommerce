import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Message, ShopSettings } from "@/schemas";
import { ContactFormValues } from "@/components/store/contact-form";

export const useShopSettings = () => {
    return useQuery({
        queryKey: ["shop-settings"],
        queryFn: async () => api.get<ShopSettings[]>("/shop-settings/"),
    });
};

export const useSubscribeNewsletter = () => {
    return useMutation({
        mutationFn: async (data: { email: string }) =>
            await api.post<Message>(`/newsletter`, {
                email: data.email,
            }),
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
        mutationFn: async (data: ContactFormValues) => await api.post<Message>(`/contact-form`, data),
        onSuccess: () => {
            toast.success("Successfully sent message");
        },
        onError: (error) => {
            toast.error("Failed to send message" + error);
        },
    });
};

export const useSyncShopDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: Record<string, string>) => await api.patch<ShopSettings>("/shop-settings/sync-shop-details", input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-settings"] });
            toast.success("Shop details synced successfully");
        },
        onError: (error) => {
            toast.error("Failed to sync shop details" + error.message);
        },
    });
};
