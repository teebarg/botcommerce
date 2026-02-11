import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { Cart, Message } from "@/schemas";
import { api } from "@/utils/fetch-api";

interface AbandonedCartStats {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    potential_revenue: number;
}

interface AbandonedCartResponse {
    carts: Cart[];
    skip: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

const AbandonedCartSearchParams = z.object({
    search: z.string().optional(),
    hours_threshold: z.number().optional(),
    skip: z.number().optional(),
});

export const getAbandonedCartsFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => AbandonedCartSearchParams.parse(input))
    .handler(async ({ data }) => {
        const res = await api.get<AbandonedCartResponse>("/cart/abandoned-carts", { params: data });
        return res;
    });

export const getAbandonedCartStatsFn = createServerFn({ method: "GET" })
    .inputValidator(z.number())
    .handler(async ({ data }) => {
        const url = `/cart/abandoned-carts/stats?hours_threshold=${data}`;
        return await api.get<AbandonedCartStats>(url);
    });

export const sendCartReminderFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            cartId: z.number(),
        })
    )
    .handler(async ({ data: { cartId } }) => {
        return await api.post<Message>(`/cart/abandoned-carts/${cartId}/send-reminder`);
    });

export const sendCartRemindersFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            hours_threshold: z.number(),
            limit: z.number().optional(),
        })
    )
    .handler(async ({ data }) => {
        return await api.post<Message>("/cart/abandoned-carts/send-reminders", data);
    });
