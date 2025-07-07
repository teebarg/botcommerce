import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { deleteCookie, setCookie } from "@/lib/util/cookie";
import { getCookie } from "@/lib/util/server-utils";
import { Address, Cart, CartComplete, CartUpdate, Order, Message } from "@/schemas";
import { api } from "@/apis/client";

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/");
        },
    });
};

export const useAddress = (addressId: number) => {
    return useQuery({
        queryKey: ["cart-address", addressId],
        queryFn: async () => await api.get<Address>(`/address/${addressId}`),
    });
};

export const useUserAddresses = () => {
    return useQuery({
        queryKey: ["user-address"],
        queryFn: async () => {
            const res = await api.get<{ addresses: Address[] }>(`/users/address`);

            return res;
        },
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ variant_id, quantity }: { variant_id: number; quantity: number }) => {
            const res = await api.post<Cart>("/cart/items", { variant_id, quantity });
            const id = await getCookie("_cart_id");

            if (!id && res.cart_number) {
                await setCookie("_cart_id", res.cart_number);
            }

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Added to cart");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add to cart");
        },
    });
};

export const useChangeCartQuantity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ item_id, quantity }: { item_id: number; quantity: number }) => {
            return await api.put<Cart>(`/cart/items/${item_id}?quantity=${quantity}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Cart updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update cart");
        },
    });
};

export const useUpdateCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ product_id, quantity }: { product_id: number; quantity: number }) => {
            return await api.patch<Cart>("/cart/update", { product_id, quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Cart updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update cart");
        },
    });
};

export const useUpdateCartDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (update: CartUpdate) => {
            return await api.put<Cart>("/cart/", update);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Cart details updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update cart details");
        },
    });
};

export const useDeleteCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item_id: number) => {
            return await api.delete<Message>(`/cart/items/${item_id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Item removed from cart");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to remove item");
        },
    });
};

export const useCompleteCart = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (complete: CartComplete) => {
            const res = await api.post<Order>("/order/", complete);

            await deleteCookie("_cart_id");

            return res;
        },
        onSuccess: (data) => {
            router.push(`/order/confirmed/${data?.order_number}`);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Order placed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to place order");
        },
    });
};
