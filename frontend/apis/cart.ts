import { fetcher } from "./fetcher";

// import { setCartSession } from "@/actions/cookie";
import { revalidate } from "@/actions/revalidate";
import { Cart, CartComplete, CartItem, CartUpdate, Message, Order } from "@/lib/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Cart API methods
export const cartApi = {
    async get(): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;

        const response = await tryCatch<Cart>(fetcher(url, { next: { tags: ["cart"] } }));

        return response;
    },
    async create(input: Cart): ApiResult<Cart> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
        const response = await tryCatch<Cart>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("cart");
        }

        return response;
    },
    async add({ variant_id, quantity }: { variant_id: number; quantity: number }): ApiResult<CartItem> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items`;
        const response = await tryCatch<CartItem>(fetcher(url, { method: "POST", body: JSON.stringify({ variant_id, quantity }) }));

        if (!response.error) {
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
            console.log("deleting cookie");
            document.cookie = "_cart_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

            revalidate("cart");
            revalidate("orders");
        }

        return response;
    },
};
