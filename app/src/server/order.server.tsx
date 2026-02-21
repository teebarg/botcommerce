import { api } from "@/utils/api.server";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Order, PaginatedOrders } from "@/schemas";

const OrderSearchParamsSchema = z
    .object({
        order_number: z.string().optional(),
        status: z.string().optional(),
        take: z.number().optional(),
        customer_id: z.number().optional(),
        sort: z.string().optional(),
    })
    .optional();

export const getOrdersFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => OrderSearchParamsSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.get<PaginatedOrders>("/order/", { params: data });
    });

export const getOrderFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return await api.get<Order>(`/order/${data}`);
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
