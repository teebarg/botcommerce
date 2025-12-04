import { serverApi } from "@/apis/server-client";
import { Order, PaginatedOrder } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const OrderSearchSchema = z.object({
    order_number: z.string().optional(),
    status: z.string().optional(),
    skip: z.number().optional(),
    take: z.number().optional(),
    customer_id: z.number().optional(),
    sort: z.string().optional(),
});

export const getOrdersFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => OrderSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await serverApi.get<PaginatedOrder>("/order/", { params: { ...data } });
        return res;
    });


export const getOrderFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await serverApi.get<Order>(`/order/${data}`);
        return res;
    });