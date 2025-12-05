import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAbandonedCartsFn, getAbandonedCartStatsFn, sendCartReminderFn, sendCartRemindersFn } from "@/server/cart.server";

interface AbandonedCartParams {
    search?: string;
    hours_threshold?: number;
    skip?: number;
    limit?: number;
}

interface AbandonedCartStatsParams {
    hours_threshold?: number;
}

export const useAbandonedCarts = (params: AbandonedCartParams = {}) => {
    return useQuery({
        queryKey: ["abandoned-carts", params],
        queryFn: () => getAbandonedCartsFn({ data: params }),
    });
};

export const useAbandonedCartStats = (params: AbandonedCartStatsParams = {}) => {
    return useQuery({
        queryKey: ["abandoned-carts", "stats", params],
        queryFn: async () => await getAbandonedCartStatsFn({ data: params.hours_threshold! }),
    });
};

export const useSendCartReminder = () => {
    return useMutation({
        mutationFn: async (cartId: number) => await sendCartReminderFn({ data: { cartId } }),
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};

export const useSendCartReminders = () => {
    return useMutation({
        mutationFn: async ({ hours_threshold, limit = 20 }: { hours_threshold: number; limit?: number }) =>
            await sendCartRemindersFn({ data: { hours_threshold, limit } }),
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};
