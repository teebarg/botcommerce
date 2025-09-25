import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { api } from "@/apis/client";
import { Order, OrderStatus, PaginatedOrder, PaymentStatus } from "@/schemas";

interface OrderSearchParams {
    query?: string;
    status?: string;
    skip?: number;
    take?: number;
    customer_id?: number;
    sort?: string;
}

export const useOrders = (searchParams: OrderSearchParams) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ["orders", JSON.stringify(searchParams)],
        queryFn: async () => await api.get<PaginatedOrder>("/order/", { params: { ...searchParams } }),
        enabled: Boolean(session?.user),
    });
};

export const useOrder = (orderNumber: string) => {
    return useQuery({
        queryKey: ["order", orderNumber],
        queryFn: async () => await api.get<Order>(`/order/${orderNumber}`),
    });
};

export const useChangeOrderStatus = () => {
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => await api.patch<Order>(`/order/${id}/status?status=${status}`),
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
        mutationFn: async ({ id, status }: { id: number; status: PaymentStatus }) => await api.patch<Order>(`/payment/${id}/status?status=${status}`),
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
        queryKey: ["order-timeline", orderId],
        enabled: !!orderId,
        queryFn: async () => await api.get<OrderTimelineEntry[]>(`/order/${orderId}/timeline`),
    });
};

export const useReturnOrderItem = () => {
    return useMutation({
        mutationFn: async ({ orderId, itemId }: { orderId: number; itemId: number }) =>
            await api.post<Order>(`/order/${orderId}/return`, { item_id: itemId }),
        onSuccess: () => {
            toast.success("Item returned. Inventory updated and totals recalculated.");
        },
        onError: (error) => {
            toast.error("Failed to return item" + error);
        },
    });
};
