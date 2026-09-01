import { toast } from "sonner";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactFormValues } from "@/components/store/contact-form";
import { Message, ShopSettings } from "@/schemas";
import { api } from "@/utils/api";
import { getShopSettingsFn } from "@/queries/generic.queries";

export const useSyncShopDetails = () => {
    return useMutation({
        mutationFn: async (input: Record<string, string>) => await api.patch<ShopSettings>("/shop-settings/", input),
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
        mutationFn: async (data: { email: string }) => await api.post<Message>(`/newsletter`, data),
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
        mutationFn: async (data: ContactFormValues) => await api.post<Message>("/contact-form", data),
        onSuccess: () => {
            toast.success("Successfully sent message");
        },
        onError: (error) => {
            toast.error("Failed to send message" + error);
        },
    });
};

const QUERY_KEY = ["shop-settings"];

export function useShopSettings() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => api.get<ShopSettings[]>("/shop-settings/all"),
    });
}

export const useSettingsQuery = () =>
    queryOptions({
        queryKey: ["shop-settings", "config"],
        queryFn: () => getShopSettingsFn(),
    });

export interface CreateShopSettingInput {
    key: string;
    value?: string | null;
}

export interface UpdateShopSettingInput {
    value?: string | null;
}

export function useCreateShopSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateShopSettingInput) => api.post<Message>("/shop-settings/", input),
        onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    });
}

export function useUpdateShopSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateShopSettingInput }) => api.patch<Message>(`/shop-settings/${id}`, input),
        onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    });
}

export function useDeleteShopSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete<Message>(`/shop-settings/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    });
}
