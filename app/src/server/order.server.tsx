import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Order, PaginatedOrder, OrderStatus, PaymentStatus } from "@/schemas";

const OrderSearchParamsSchema = z
    .object({
        order_number: z.string().optional(),
        status: z.string().optional(),
        skip: z.number().optional(),
        take: z.number().optional(),
        customer_id: z.number().optional(),
        sort: z.string().optional(),
    })
    .optional();

export const getOrdersFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => OrderSearchParamsSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.get<PaginatedOrder>("/order/", { params: data });
    });

export const getOrderFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return await api.get<Order>(`/order/${data}`);
    });

export const changeOrderStatusFn = createServerFn({ method: "POST" }) // Using POST for RPC call
    .inputValidator(
        z.object({
            id: z.number(),
            // Assuming OrderStatus is a string literal type/enum defined in schemas
            status: z.custom<OrderStatus>(),
        })
    )
    .handler(async ({ data }) => {
        return await api.patch<Order>(`/order/${data.id}/status?status=${data.status}`, {});
    });

export const changePaymentStatusFn = createServerFn({ method: "POST" }) // Using POST for RPC call
    .inputValidator(
        z.object({
            id: z.number(),
            status: z.custom<PaymentStatus>(),
        })
    )
    .handler(async ({ data }) => {
        return await api.patch<Order>(`/payment/${data.id}/status?status=${data.status}`, {});
    });

export interface OrderTimelineEntry {
    id: number;
    order_id: number;
    from_status?: string | null;
    to_status?: string | null;
    message?: string | null;
    created_at: string;
}

export const getOrderTimelineFn = createServerFn({ method: "GET" })
    .inputValidator(z.number())
    .handler(async ({ data: orderId }) => {
        return await api.get<OrderTimelineEntry[]>(`/order/${orderId}/timeline`);
    });

export const returnOrderItemFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            orderId: z.number(),
            itemId: z.number(),
        })
    )
    .handler(async ({ data }) => {
        return await api.post<Order>(`/order/${data.orderId}/return`, { item_id: data.itemId });
    });

export const createOrderNoteFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            orderId: z.number(),
            notes: z.string(),
        })
    )
    .handler(async ({ data: { orderId, notes } }) => {
        return await api.patch<Order>(`/order/${orderId}/notes`, { notes });
    });
