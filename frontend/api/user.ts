import { fetcher } from "./fetcher";

import { User, Wishlist } from "@/lib/models";

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
    async wishlist(): Promise<Wishlist | null> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;

        try {
            const response = await fetcher<Wishlist>(url, { next: { tags: ["wishlist"] } });

            return response;
        } catch (error) {
            return null;
        }
    },
    async addWishlist(product_id: number): Promise<Wishlist> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
        const response = await fetcher<Wishlist>(url, { method: "POST", body: JSON.stringify({ product_id }) });

        return response;
    },
    async deleteWishlist(id: number): Promise<{ success: boolean; message: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist/${id}`;

        await fetcher<{ message: string }>(url, { method: "DELETE" });

        return { success: true, message: "Wishlist deleted successfully" };
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
