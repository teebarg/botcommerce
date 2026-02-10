import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeOrderStatusFn, changePaymentStatusFn, getOrderTimelineFn, returnOrderItemFn } from "@/server/order.server";
import type { OrderStatus, PaymentStatus } from "@/schemas";

export const useChangeOrderStatus = () => {
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => await changeOrderStatusFn({ data: { id, status } }),
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
        mutationFn: async ({ id, status }: { id: number; status: PaymentStatus }) => await changePaymentStatusFn({ data: { id, status } }),
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
        mutationFn: async ({ orderId, itemId }: { orderId: number; itemId: number }) => await returnOrderItemFn({ data: { orderId, itemId } }),
        onSuccess: () => {
            toast.success("Item returned. Inventory updated and totals recalculated.");
        },
        onError: (error) => {
            toast.error("Failed to return item" + error);
        },
    });
};
