import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Cart, CartStatus } from "@/schemas";

interface AbandonedCartParams {
    status?: string;
    search?: string;
    hours_threshold?: number;
    skip?: number;
    limit?: number;
}

interface AbandonedCartStats {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    total_abandoned_value: number;
    recovery_rate: number;
    recovered_last_30_days: number;
    total_abandoned_last_30_days: number;
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
            return await api.get<AbandonedCartResponse>("/cart/admin/abandoned-carts", {
                params: {
                    status: params.status,
                    search: params.search,
                    hours_threshold: params.hours_threshold || 24,
                    skip: params.skip || 0,
                    limit: params.limit || 20
                }
            });
        },
    });
};

export const useAbandonedCartStats = () => {
    return useQuery({
        queryKey: ["abandoned-cart-stats"],
        queryFn: async () => {
            return await api.get<AbandonedCartStats>("/cart/admin/abandoned-carts/stats");
        },
    });
};

export const useSendCartReminder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (cartId: number) => {
            return await api.post(`/cart/admin/abandoned-carts/${cartId}/send-reminder`);
        },
        onSuccess: (data, cartId) => {
            queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] });
            queryClient.invalidateQueries({ queryKey: ["abandoned-cart-stats"] });
            toast.success(`Recovery email sent to ${data.email}`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};

export const useUpdateCartStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ cartId, status }: { cartId: number; status: CartStatus }) => {
            return await api.patch(`/cart/admin/abandoned-carts/${cartId}/status`, { status });
        },
        onSuccess: (data, { cartId, status }) => {
            queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] });
            queryClient.invalidateQueries({ queryKey: ["abandoned-cart-stats"] });
            toast.success(`Cart status updated to ${status}`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update cart status");
        },
    });
};
