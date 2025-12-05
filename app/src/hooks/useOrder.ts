import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeOrderStatusFn, changePaymentStatusFn, getOrderFn, getOrdersFn, getOrderTimelineFn, returnOrderItemFn } from "@/server/order.server";
import type { OrderStatus, PaymentStatus } from "@/schemas";

interface OrderSearchParams {
    order_number?: string;
    status?: string;
    skip?: number;
    take?: number;
    customer_id?: number;
    sort?: string;
}

export const ordersQueryOptions = (searchParams: OrderSearchParams) =>
    queryOptions({
        queryKey: ["orders", JSON.stringify(searchParams)],
        queryFn: () => getOrdersFn({ data: { ...searchParams } }),
    });

export const useOrders = (searchParams: OrderSearchParams) => {
    // const { data: session } = useSession();

    return useQuery({
        queryKey: ["orders", JSON.stringify(searchParams)],
        queryFn: () => getOrdersFn({ data: searchParams }),
        // enabled: Boolean(session?.user),
    });
};

export const orderQueryOptions = (orderNumber: string) => ({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrderFn({ data: orderNumber }),
});

export const useOrder = (orderNumber: string) => {
    return useQuery({
        queryKey: ["order", orderNumber],
        queryFn: () => getOrderFn({ data: orderNumber }),
    });
};

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
