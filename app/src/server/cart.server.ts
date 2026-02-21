import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { Cart, Message, Order } from "@/schemas";
import { api } from "@/utils/api.server";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";

const CART_COOKIE = "_cart_id";

export const getCartFn = createServerFn({ method: "GET" }).handler(async () => {
    const cartId = getCookie(CART_COOKIE);
    const res = await api.get<Cart>("/cart/", { headers: { cartId: cartId ?? "" } });

    if (res.cart_number) {
        setCookie(CART_COOKIE, res.cart_number, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
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
            setCookie(CART_COOKIE, res.cart_number, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
            });
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
        return await api.put<Cart>(`/cart/items/${item_id}?quantity=${quantity}`, {}, { headers: { cartId: cartId ?? "" } });
    });

export const updateCartDetailsFn = createServerFn({ method: "POST" })
    .inputValidator(z.any())
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
    .inputValidator(z.any())
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);
        const res = await api.post<Order>("/order/", data, { headers: { cartId: cartId ?? "" } });

        deleteCookie(CART_COOKIE, { path: "/" });

        return res;
    });

export const applyWalletCreditFn = createServerFn({ method: "POST" })
    .handler(async () => {
        const cartId = getCookie(CART_COOKIE);
        return await api.post<Message>("/cart/apply-wallet", {}, { headers: { cartId: cartId ?? "" } });
    });

export const removeWalletCreditFn = createServerFn({ method: "POST" })
    .handler(async () => {
        const cartId = getCookie(CART_COOKIE);
        return await api.post<Message>("/cart/remove-wallet", {}, { headers: { cartId: cartId ?? "" } });
    });

export const invalidateCartFn = createServerFn({ method: "POST" }).handler(async () => {
    deleteCookie(CART_COOKIE, { path: "/" });
    return { success: true };
});
