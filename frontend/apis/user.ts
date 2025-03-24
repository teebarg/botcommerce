import { fetcher } from "./fetcher";

import { ApiResult, tryCatch } from "@/lib/try-catch";
import { Message, User, Wishlist } from "@/lib/models";
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
    async create(input: User): Promise<User> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`;
        const response = await fetcher<User>(url, { method: "POST", body: JSON.stringify(input) });

        return response;
    },
    async update(id: number, input: any): ApiResult<User> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`;
        const response = await tryCatch<User>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("user");
        }

        return response;
    },
    async delete(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`;
        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("user");
        }

        return response;
    },
};
