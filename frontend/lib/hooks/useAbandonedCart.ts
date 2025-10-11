import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Cart } from "@/schemas";

interface AbandonedCartParams {
    status?: string;
    search?: string;
    hours_threshold?: number;
    skip?: number;
    limit?: number;
}

interface AbandonedCartStatsParams {
    hours_threshold?: number;
}

interface AbandonedCartStats {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    potential_revenue: number;
}

interface AbandonedCartResponse {
    carts: Cart[];
    skip: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

export const useAbandonedCarts = (params: AbandonedCartParams = {}) => {
    return useQuery({
        queryKey: ["abandoned-carts", params],
        queryFn: async () => {
            return await api.get<AbandonedCartResponse>("/cart/abandoned-carts", {
                params: {
                    status: params.status,
                    search: params.search,
                    hours_threshold: params.hours_threshold || 24,
                    skip: params.skip || 0,
                    limit: params.limit || 20,
                },
            });
        },
    });
};

export const useAbandonedCartStats = (params: AbandonedCartStatsParams = {}) => {
    return useQuery({
        queryKey: ["abandoned-carts", "stats", params],
        queryFn: async () => {
            return await api.get<AbandonedCartStats>(`/cart/abandoned-carts/stats?hours_threshold=${params.hours_threshold}`);
        },
    });
};

export const useSendCartReminder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (cartId: number) => {
            return await api.post(`/cart/abandoned-carts/${cartId}/send-reminder`);
        },
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};

export const useSendCartReminders = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ hours_threshold, limit = 20 }: { hours_threshold: number; limit?: number }) => {
            return await api.post(`/cart/abandoned-carts/send-reminders`, {
                hours_threshold,
                limit,
            });
        },
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};
