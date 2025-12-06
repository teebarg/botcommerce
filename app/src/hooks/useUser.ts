import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    createGuestUserFn,
    createUserFn,
    createWishlistItemFn,
    deleteUserFn,
    deleteWishlistItemFn,
    getMeFn,
    getRecentlyViewedFn,
    getUsersFn,
    getUserWishlistFn,
    getWishlistFn,
    updateUserFn,
} from "@/server/users.server";
import { useRouteContext } from "@tanstack/react-router";

interface UsersParams {
    query?: string;
    role?: "ADMIN" | "CUSTOMER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING";
    skip?: number;
    limit?: number;
    sort?: string;
}

interface UsersQueryOptions {
    enabled?: boolean;
}

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: () => getMeFn(),
        enabled: typeof window !== "undefined",
    });
};

export const useUsers = (searchParams: UsersParams, options?: UsersQueryOptions) => {
    return useQuery({
        queryKey: ["users", JSON.stringify(searchParams)],
        queryFn: () => getUsersFn({ data: searchParams }),
        enabled: options?.enabled,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: any) => await createUserFn({ data: input }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create user" + error);
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await updateUserFn({ data: { id, input } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update user" + error);
        },
    });
};

export const useCreateGuestUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { first_name: string; last_name: string }) => await createGuestUserFn({ data: input }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Guest user created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create guest user" + error);
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await deleteUserFn({ data: id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete user" + error);
        },
    });
};

export const userWishlistQueryOptions = () =>
    queryOptions({
        queryKey: ["products", "wishlist"],
        queryFn: () => getUserWishlistFn(),
    });

export const useUserWishlist = () => {
    const { session } = useRouteContext({ strict: false });

    return useQuery({
        queryKey: ["products", "wishlist", session?.id?.toString()],
        queryFn: () => getWishlistFn(),
        enabled: Boolean(session?.user),
    });
};

export const useUserRecentlyViewed = (limit: number = 12, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["products", "recently-viewed"],
        queryFn: () => getRecentlyViewedFn({ data: limit }),
        enabled: enabled,
    });
};

export const useUserCreateWishlist = () => {
    return useMutation({
        mutationFn: async (product_id: number) => await createWishlistItemFn({ data: product_id }),
        onSuccess: () => {
            toast.success("Wishlist created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create wishlist" + error);
        },
    });
};

export const useUserDeleteWishlist = () => {
    return useMutation({
        mutationFn: async (id: number) => await deleteWishlistItemFn({ data: id }),
        onSuccess: () => {
            toast.success("Wishlist deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete wishlist" + error);
        },
    });
};

export const useInvalidateMe = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.removeQueries({ queryKey: ["me"] });
    };

    return invalidate;
};
