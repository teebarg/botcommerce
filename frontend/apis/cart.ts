import { fetcher } from "./fetcher";

import { revalidate } from "@/actions/revalidate";
import { Cart, CartComplete, CartUpdate, Message, Order } from "@/types/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { deleteCookie, setCookie } from "@/lib/util/cookie";
import { getCookie } from "@/lib/util/server-utils";

// Cart API methods
export const cartApi = {
    async get(): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;

        const response = await tryCatch<Cart>(fetcher(url, { next: { tags: ["cart"] } }));

        return response;
    },
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
            revalidate("cart");
        }

        return response;
    },
    async changeQuantity({ item_id, quantity }: { item_id: number; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items/${item_id}?quantity=${quantity}`;

        const response = await tryCatch<Cart>(fetcher(url, { method: "PUT" }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async update({ product_id, quantity }: { product_id: number; quantity: number }): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`;

        const response = await tryCatch<Cart>(fetcher(url, { method: "PATCH", body: JSON.stringify({ product_id, quantity }) }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async updateDetails(update: CartUpdate): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        const response = await tryCatch<Cart>(fetcher(url, { method: "PUT", body: JSON.stringify({ ...update }) }));

        if (!response.error) {
            revalidate("cart");
            revalidate("user");
            revalidate("orders");
        }

        return response;
    },
    async delete(item_id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items/${item_id}`;

        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async complete(complete: CartComplete): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;
        const response = await tryCatch<Order>(fetcher(url, { method: "POST", body: JSON.stringify({ ...complete }) }));

        if (!response.error) {
            await deleteCookie("_cart_id");

            revalidate("cart");
            revalidate("orders");
        }

        return response;
    },
};
