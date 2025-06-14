import { fetcher } from "./fetcher";

import { ApiResult, tryCatch } from "@/lib/try-catch";
import { Message, User, Wishlist } from "@/schemas";
import { revalidate } from "@/actions/revalidate";

// User API methods
export const userApi = {
    async me(): ApiResult<User> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`;
        const response = await tryCatch<User>(fetcher(url, { next: { tags: ["user"] } }));

        return response;
    },
    async wishlist(): ApiResult<Wishlist> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
        const response = await tryCatch<Wishlist>(fetcher(url, { next: { tags: ["wishlist"] } }));

        return response;
    },
    async addWishlist(product_id: number): ApiResult<Wishlist> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
        const response = await tryCatch<Wishlist>(fetcher(url, { method: "POST", body: JSON.stringify({ product_id }) }));

        if (!response.error) {
            revalidate("wishlist");
        }

        return response;
    },
    async deleteWishlist(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist/${id}`;

        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("wishlist");
        }

        return response;
    },
    async create(input: any): ApiResult<User> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`;

        return await tryCatch<User>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));
    },
    async update(id: number, input: any): ApiResult<User> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`;

        return await tryCatch<User>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));
    },
};
