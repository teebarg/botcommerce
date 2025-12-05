import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PaginatedUser, ProductSearch, User, Wishlist } from "@/schemas";

export const UserSearchSchema = z.object({
    query: z.string().optional(),
    role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
});

export const getUserWishlistFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Wishlist>("/users/wishlist");
});

export const getMeFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<User>("/users/me");
});

export const getUsersFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => UserSearchSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.get<PaginatedUser>("/users/", { params: data });
    });

export const createUserFn = createServerFn({ method: "POST" })
    .inputValidator(z.any()) // Using z.any() to match 'input: any'
    .handler(async ({ data }) => {
        return await api.post<User>("/users", data);
    });

export const updateUserFn = createServerFn({ method: "POST" }) // Using POST for RPC, internal is PATCH
    .inputValidator(
        z.object({
            id: z.number(),
            input: z.any(),
        })
    )
    .handler(async ({ data }) => {
        return await api.patch<User>(`/users/${data.id}`, data.input);
    });

export const createGuestUserFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            first_name: z.string(),
            last_name: z.string(),
        })
    )
    .handler(async ({ data }) => {
        return await api.post<User>("/users/create-guest", data);
    });

export const deleteUserFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<User>(`/users/${id}`);
    });

export const getWishlistFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Wishlist>("/users/wishlist");
});

export const getRecentlyViewedFn = createServerFn({ method: "GET" })
    .inputValidator(z.number().optional())
    .handler(async ({ data: limit }) => {
        return await api.get<ProductSearch[]>("/users/recently-viewed", {
            params: { limit: limit || 12 },
        });
    });

export const createWishlistItemFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: product_id }) => {
        return await api.post<Wishlist>("/users/wishlist", { product_id });
    });

export const deleteWishlistItemFn = createServerFn({ method: "POST" })
    .inputValidator(z.number()) // id
    .handler(async ({ data: id }) => {
        return await api.delete<Wishlist>(`/users/wishlist/${id}`);
    });
