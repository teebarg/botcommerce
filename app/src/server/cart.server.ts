// import { createServerFn } from "@tanstack/start";
// import { getCookie, setCookie, deleteCookie } from "vinxi/http";
import { z } from "zod";
// Assuming you have an axios instance or fetch wrapper suited for server-side calls
// import { api } from "@/lib/api";
// import type { Cart, CartUpdate, CartComplete, Order, Message } from "@/types"; // Adjust import
import { createServerFn } from "@tanstack/react-start";
import { Cart, CartComplete, CartUpdate, Message, Order } from "@/schemas";

const CART_COOKIE = "_cart_id";

/**
 * FETCH CART
 */
export const getCartFn = createServerFn({ method: "GET" }).handler(async () => {
    // 1. You might need to forward the cookie to your upstream API
    const cartId = getCookie(CART_COOKIE);

    // 2. Call your upstream API
    // Note: Ensure your 'api' client handles absolute URLs if running on the server
    const res = await api.get<Cart>("/cart/", {
        headers: cartId ? { "X-Cart-ID": cartId } : undefined,
    });

    // 3. Set the cookie on the Response (Server Side)
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

/**
 * ADD TO CART
 */
export const addToCartFn = createServerFn({ method: "POST" })
    .validator(
        z.object({
            variant_id: z.number(),
            quantity: z.number(),
        })
    )
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);

        const res = await api.post<Cart>("/cart/items", data, {
            headers: cartId ? { "X-Cart-ID": cartId } : undefined,
        });

        if (res.cart_number) {
            setCookie(CART_COOKIE, res.cart_number, { path: "/" });
        }

        return res;
    });

/**
 * UPDATE QUANTITY
 */
export const updateCartQuantityFn = createServerFn({ method: "POST" })
    .validator(
        z.object({
            item_id: z.number(),
            quantity: z.number(),
        })
    )
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);

        // Note: api.put usually returns the data, make sure to await it
        return await api.put<Cart>(
            `/cart/items/${data.item_id}?quantity=${data.quantity}`,
            {},
            { headers: cartId ? { "X-Cart-ID": cartId } : undefined }
        );
    });

/**
 * UPDATE DETAILS
 */
export const updateCartDetailsFn = createServerFn({ method: "POST" })
    .validator(
        // Define your CartUpdate schema here completely
        z.custom<CartUpdate>()
    )
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);
        return await api.put<Cart>("/cart/", data, {
            headers: cartId ? { "X-Cart-ID": cartId } : undefined,
        });
    });

/**
 * DELETE ITEM
 */
export const deleteCartItemFn = createServerFn({ method: "POST" })
    .validator(z.number()) // Just accepting the ID directly
    .handler(async ({ data: item_id }) => {
        const cartId = getCookie(CART_COOKIE);
        return await api.delete<Message>(`/cart/items/${item_id}`, {
            headers: cartId ? { "X-Cart-ID": cartId } : undefined,
        });
    });

/**
 * COMPLETE ORDER
 */
export const completeCartFn = createServerFn({ method: "POST" })
    .validator(z.custom<CartComplete>())
    .handler(async ({ data }) => {
        const cartId = getCookie(CART_COOKIE);

        const res = await api.post<Order>("/order/", data, {
            headers: cartId ? { "X-Cart-ID": cartId } : undefined,
        });

        // Server-side cookie cleanup
        deleteCookie(CART_COOKIE, { path: "/" });

        return res;
    });

/**
 * INVALIDATE / LOGOUT CART
 */
export const invalidateCartFn = createServerFn({ method: "POST" }).handler(async () => {
    deleteCookie(CART_COOKIE, { path: "/" });
    return { success: true };
});
