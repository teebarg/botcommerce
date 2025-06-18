import { ApiResult } from "@/lib/try-catch";
import { Message, User, Wishlist } from "@/schemas";
import { api } from "@/apis/base";

// User API methods
export const userApi = {
    async me(): ApiResult<User> {
        return await api.get<User>("/users/me");
    },
    async wishlist(): ApiResult<Wishlist> {
        return await api.get<Wishlist>("/users/wishlist");
    },
    async addWishlist(product_id: number): ApiResult<Wishlist> {
        return await api.post<Wishlist>("/users/wishlist", { product_id });
    },
    async deleteWishlist(id: number): ApiResult<Message> {
        return await api.delete<Message>(`/users/wishlist/${id}`);
    },
    async create(input: any): ApiResult<User> {
        return await api.post<User>("/users", input);
    },
    async update(id: number, input: any): ApiResult<User> {
        return await api.patch<User>(`/users/${id}`, input);
    },
};
