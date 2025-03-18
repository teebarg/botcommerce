import { ApiResult, tryCatch } from "@/lib/try-catch";
import { fetcher } from "./fetcher";

import { Message, User, Wishlist } from "@/lib/models";
import { revalidate } from "@/actions/revalidate";

// User API methods
export const userApi = {
    async me(): Promise<User> {
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`;
            const response = await fetcher<User>(url, { next: { tags: ["user"] } });

            return response;
        } catch (error) {
            return null as unknown as User;
        }
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
    async update(id: string, input: User): Promise<User> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`;
        const response = await fetcher<User>(url, { method: "PATCH", body: JSON.stringify(input) });

        return response;
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`;

        await fetcher<{ message: string }>(url, { method: "DELETE" });

        return { success: true, message: "User deleted successfully" };
    },
};
