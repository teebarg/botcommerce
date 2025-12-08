import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { Cart, CartComplete, CartUpdate, Message, Order } from "@/schemas";
import { api } from "@/utils/fetch-api";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";

const CART_COOKIE = "_cart_id";

export const getCartFn = createServerFn({ method: "GET" }).handler(async () => {
    const cartId = getCookie(CART_COOKIE);
    const res = await api.get<Cart>("/cart/", { headers: { cartId: cartId ?? "" } });

    if (res.cart_number) {
        setCookie(CART_COOKIE, res.cart_number, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            // httpOnly: true, // Recommended for security
            // secure: process.env.NODE_ENV === 'production'
        });
    }

    return res;
});

export const addToCartFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            variant_id: z.number(),
            quantity: z.number(),
        })
    )
    .handler(async ({ data: { variant_id, quantity } }) => {
        const cartId = getCookie(CART_COOKIE);

        const res = await api.post<Cart>("/cart/items", { variant_id, quantity }, { headers: { cartId: cartId ?? "" } });

        if (res.cart_number) {
            setCookie(CART_COOKIE, res.cart_number, { path: "/" });
        }

        return res;
    });

export const updateCartQuantityFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            item_id: z.number(),
            quantity: z.number(),
        })
    )
    .handler(async ({ data: { item_id, quantity } }) => {
        const cartId = getCookie(CART_COOKIE);
        return await api.put<Cart>(`/cart/items/${item_id}?quantity=${quantity}`, { headers: { cartId: cartId ?? "" } });
    });

export const updateCartDetailsFn = createServerFn({ method: "POST" })
    .inputValidator(z.custom<CartUpdate>())
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);
        return await api.put<Cart>("/cart/", data, { headers: { cartId: cartId ?? "" } });
    });

export const deleteCartItemFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: item_id }) => {
        const cartId = getCookie(CART_COOKIE);
        return await api.delete<Message>(`/cart/items/${item_id}`, { headers: { cartId: cartId ?? "" } });
    });

export const completeCartFn = createServerFn({ method: "POST" })
    .inputValidator(z.custom<CartComplete>())
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);

        const res = await api.post<Order>("/order/", data, { headers: { cartId: cartId ?? "" } });

        deleteCookie(CART_COOKIE, { path: "/" });

        return res;
    });

export const invalidateCartFn = createServerFn({ method: "POST" }).handler(async () => {
    deleteCookie(CART_COOKIE, { path: "/" });
    return { success: true };
});


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
    limit: z.number().optional(),
});

export const getAbandonedCartsFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => AbandonedCartSearchParams.parse(input))
    .handler(async ({ data }) => {
        const res = await api.get<AbandonedCartResponse>("/cart/abandoned-carts", { params: data });
        return res;
    });

export const getAbandonedCartStatsFn = createServerFn({ method: "GET" })
    .inputValidator((d: number) => d)
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
        return await api.post<Message>(`/cart/abandoned-carts/send-reminders`, data);
    });
