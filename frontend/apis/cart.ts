import { fetcher } from "./fetcher";

import { Cart, CartComplete, CartUpdate, Order } from "@/schemas";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { deleteCookie, setCookie } from "@/lib/util/cookie";
import { getCookie } from "@/lib/util/server-utils";
import { Message } from "@/schemas";

// Cart API methods
export const cartApi = {
    async add({ variant_id, quantity }: { variant_id: number; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items`;
        const response = await tryCatch<Cart>(
            fetcher(url, { method: "POST", credentials: "include", body: JSON.stringify({ variant_id, quantity }) })
        );

        if (!response.error && response.data) {
            const id = await getCookie("_cart_id");

            if (!id) {
                await setCookie("_cart_id", response.data?.cart_number);
            }
        }

        return response;
    },
    async changeQuantity({ item_id, quantity }: { item_id: number; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items/${item_id}?quantity=${quantity}`;

        return await tryCatch<Cart>(fetcher(url, { method: "PUT" }));
    },
    async update({ product_id, quantity }: { product_id: number; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`;

        return await tryCatch<Cart>(fetcher(url, { method: "PATCH", body: JSON.stringify({ product_id, quantity }) }));
    },
    async updateDetails(update: CartUpdate): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;

        return await tryCatch<Cart>(fetcher(url, { method: "PUT", body: JSON.stringify({ ...update }) }));
    },
    async delete(item_id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items/${item_id}`;

        return await tryCatch<Message>(fetcher(url, { method: "DELETE" }));
    },
    async complete(complete: CartComplete): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;
        const response = await tryCatch<Order>(fetcher(url, { method: "POST", body: JSON.stringify({ ...complete }) }));

        if (!response.error) {
            await deleteCookie("_cart_id");
        }

        return response;
    },
};
