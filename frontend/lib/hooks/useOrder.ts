import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useInvalidate } from "./useApi";

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
    return useQuery({
        queryKey: ["orders", JSON.stringify(searchParams)],
        queryFn: async () => await api.get<PaginatedOrder>("/order/", { params: { ...searchParams } }),
    });
};

export const useOrder = (orderNumber: string) => {
    return useQuery({
        queryKey: ["order", orderNumber],
        queryFn: async () => await api.get<Order>(`/order/${orderNumber}`),
    });
};

export const useChangeOrderStatus = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => await api.patch<Order>(`/order/${id}/status?status=${status}`),
        onSuccess: () => {
            toast.success("Successfully changed order status");
            invalidate("orders");
        },
        onError: (error) => {
            toast.error("Failed to change order status" + error);
        },
    });
};

export const useChangePaymentStatus = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: PaymentStatus }) => await api.patch<Order>(`/payment/${id}/status?status=${status}`),
        onSuccess: () => {
            toast.success("Successfull!", {
                description: "Payment status changed successfully",
            });
            invalidate("orders");
        },
        onError: (error) => {
            toast.error("An error occurred!", {
                description: "Payment status change failed" + error,
            });
        },
    });
};
