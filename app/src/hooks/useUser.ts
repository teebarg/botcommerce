import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getWishlistListingFn } from "@/server/users.server";
import { api } from "@/utils/api";
import { User, Wishlist } from "@/schemas";

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.patch<User>(`/users/${id}`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            toast.error("Failed to update user" + error);
        },
    });
};

export const useCreateGuestUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { first_name: string; last_name: string }) => await api.post<User>("/users/create-guest", input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            toast.error("Failed to create guest user" + error);
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

export const userWishlistQuery = () => ({
    queryKey: ["products", "wishlist"],
    queryFn: () => getWishlistListingFn(),
});

export const useUserWishlist = () => {
    return useQuery(userWishlistQuery());
};


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

export const useInvalidateMe = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.removeQueries({ queryKey: ["me"] });
    };

    return invalidate;
};
