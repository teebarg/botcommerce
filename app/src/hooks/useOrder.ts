import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrderTimelineFn } from "@/server/order.server";
import type { Order, OrderStatus, PaymentStatus } from "@/schemas";
import { clientApi } from "@/utils/api.client";

export const useChangeOrderStatus = () => {
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) =>
            await clientApi.patch<Order>(`/order/${id}/status?status=${status}`, {}),
        onSuccess: () => {
            toast.success("Successfully changed order status");
        },
        onError: (error) => {
            toast.error("Failed to change order status" + error);
        },
    });
};

export const useChangePaymentStatus = () => {
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: PaymentStatus }) =>
            await clientApi.patch<Order>(`/payment/${id}/status?status=${status}`, {}),
        onSuccess: () => {
            toast.success("Successful!", {
                description: "Payment status changed successfully",
            });
        },
        onError: (error) => {
            toast.error("An error occurred!", {
                description: "Payment status change failed" + error,
            });
        },
    });
};

export interface OrderTimelineEntry {
    id: number;
    order_id: number;
    from_status?: string | null;
    to_status?: string | null;
    message?: string | null;
    created_at: string;
}

export const useOrderTimeline = (orderId?: number) => {
    return useQuery({
        queryKey: ["order-timeline", orderId?.toString()],
        enabled: !!orderId,
        queryFn: () => getOrderTimelineFn({ data: orderId! }),
    });
};

export const useReturnOrderItem = () => {
    return useMutation({
        mutationFn: async ({ orderId, itemId }: { orderId: number; itemId: number }) =>
            await clientApi.post<Order>(`/order/${orderId}/return`, { item_id: itemId }),
        onSuccess: () => {
            toast.success("Item returned. Inventory updated and totals recalculated.");
        },
        onError: (error) => {
            toast.error("Failed to return item" + error);
        },
    });
};
