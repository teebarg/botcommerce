import { ApiResult, tryCatch } from "@/lib/try-catch";
import { Message, User, Wishlist } from "@/schemas";
import { api } from "@/apis/client";

// User API methods
export const userApi = {
    async wishlist(): ApiResult<Wishlist> {
        return await tryCatch<Wishlist>(api.get<Wishlist>("/users/wishlist"));
    },
    async addWishlist(product_id: number): ApiResult<Wishlist> {
        return await tryCatch<Wishlist>(api.post<Wishlist>("/users/wishlist", { product_id }));
    },
    async deleteWishlist(id: number): ApiResult<Message> {
        return await tryCatch<Message>(api.delete<Message>(`/users/wishlist/${id}`));
    },
    async create(input: any): ApiResult<User> {
        return await tryCatch<User>(api.post<User>("/users", input));
    },
    async update(id: number, input: any): ApiResult<User> {
        return await tryCatch<User>(api.patch<User>(`/users/${id}`, input));
    },
};
