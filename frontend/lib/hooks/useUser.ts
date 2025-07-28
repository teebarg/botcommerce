import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { PaginatedUser, User, Wishlist } from "@/schemas";

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            return await api.get<User>("/users/me");
        },
        enabled: typeof window !== "undefined",
    });
};

interface UsersParams {
    query?: string;
    role?: "ADMIN" | "CUSTOMER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING";
    page?: number;
    limit?: number;
    sort?: string;
}

export const useUsers = (searchParams: UsersParams) => {
    return useQuery({
        queryKey: ["users", JSON.stringify(searchParams)],
        queryFn: async () => await api.get<PaginatedUser>(`/users/`, { params: { ...searchParams } }),
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: any) => await api.post<User>("/users", input),
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
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.patch<User>(`/users/${id}`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update user" + error);
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<User>(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete user" + error);
        },
    });
};

export const useUserWishlist = () => {
    return useQuery({
        queryKey: ["wishlist"],
        queryFn: async () => await api.get<Wishlist>(`/users/wishlist`),
        enabled: typeof window !== "undefined",
    });
};

export const useUserCreateWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product_id: number) => await api.post<Wishlist>("/users/wishlist", { product_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            toast.success("Wishlist created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create wishlist" + error);
        },
    });
};

export const useUserDeleteWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Wishlist>(`/users/wishlist/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
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
