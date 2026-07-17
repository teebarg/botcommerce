import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchUserFn, updateAppSessionFn } from "@/server/users.server";
import { api } from "@/utils/api";
import { Session, User, Wishlist } from "@/schemas";
import { queryOptions } from '@tanstack/react-query'

export const authQueryOptions = () => queryOptions({
    queryKey: ["session"],
    queryFn: () => fetchUserFn(),
    staleTime: 5 * 60 * 1000,
})

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.patch<User>(`/users/${id}`, input),
        onError: (error) => {
            toast.error("Failed to update user" + error);
        },
    });
};

export const useCreateGuestUser = () => {
    return useMutation({
        mutationFn: async (input: { first_name: string; last_name: string }) => await api.post<User>("/users/create-guest", input),
        onError: (error) => {
            toast.error("Failed to create guest user" + error);
        },
    });
};

export const useDeleteUser = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<User>(`/users/${id}`),
        onSuccess: () => {
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete user" + error);
        },
    });
};

export const useImpersonateUser = () => {
    return useMutation({
        mutationFn: async (userId: number) => {
            const result = await api.post<Session>(`/auth/impersonate/${userId}`);
            await updateAppSessionFn({ data: result });
        },
        onError: (error) => {
            toast.error("Failed to Impersonate", { description: `${error}` });
        },
    });
};

export const useStopImpersonation = () => {
    return useMutation({
        mutationFn: async () => {
            const result = await api.post<Session>(`/auth/stop-impersonation`);
            await updateAppSessionFn({ data: result });
        },
        onError: (error) => {
            toast.error("Failed to stop impersonation", { description: `${error}` });
        },
    });
};

export const wishlistQueryOptions = () =>
    queryOptions({
        queryKey: ["products", "wishlist"],
        queryFn: () => api.get<Wishlist>("/users/wishlist"),
    });

export const useUserCreateWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (product_id: number) => await api.post<Wishlist>("/users/wishlist", { product_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products", "wishlist"] });
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
            queryClient.invalidateQueries({ queryKey: ["products", "wishlist"] });
            toast.success("Wishlist deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete wishlist" + error);
        },
    });
};
