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

export const getMeFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<User>("/users/me");
});

export const getUserFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data: email }) => {
        return await api.get<User>(`/users/get-user?email=${email}`);
    });

export const getUsersFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => UserSearchSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.get<PaginatedUser>("/users/", { params: data });
    });

export const getWishlistListingFn = createServerFn().handler(async () => {
    return await api.get<Wishlist>("/users/wishlist");
});

export const getRecentlyViewedFn = createServerFn({ method: "GET" })
    .inputValidator(z.number().optional())
    .handler(async ({ data: limit }) => {
        return await api.get<ProductSearch[]>("/users/recently-viewed", {
            params: { limit: limit || 12 },
        });
    });
