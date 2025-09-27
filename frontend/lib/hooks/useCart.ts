import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { deleteCookie, setCookie } from "@/lib/util/cookie";
import { Cart, CartComplete, CartUpdate, Order, Message } from "@/schemas";
import { api } from "@/apis/client";

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/");
        },
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ variant_id, quantity }: { variant_id: number; quantity: number }) => {
            const res = await api.post<Cart>("/cart/items", { variant_id, quantity });

            if (res.cart_number) {
                await setCookie("_cart_id", res.cart_number);
            }

            return res;
        },
        onMutate: async ({ variant_id, quantity }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            // Snapshot the previous value
            const previousCart = queryClient.getQueryData<Cart>(["cart"]);

            if (previousCart) {
                queryClient.setQueryData<Cart>(["cart"], (old) => {
                    if (!old) return old;

                    // Check if item already exists in cart
                    const existingItemIndex = old.items.findIndex((item) => item.variant_id === variant_id);

                    if (existingItemIndex >= 0) {
                        // Update existing item quantity
                        const updatedItems = [...old.items];

                        updatedItems[existingItemIndex] = {
                            ...updatedItems[existingItemIndex],
                            quantity: updatedItems[existingItemIndex].quantity + quantity,
                        };

                        return {
                            ...old,
                            items: updatedItems,
                        };
                    } else {
                        return old;
                    }
                });
            }

            return { previousCart };
        },
        onSuccess: () => {
            // Invalidate to get updated cart with correct totals from background task
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Added to cart", { duration: 1000 });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData<Cart>(["cart"], context.previousCart);
            }
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
        onMutate: async ({ item_id, quantity }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            // Snapshot the previous value
            const previousCart = queryClient.getQueryData<Cart>(["cart"]);

            if (previousCart) {
                queryClient.setQueryData<Cart>(["cart"], (old) => {
                    if (!old) return old;

                    const updatedItems = old.items.map((item) => (item.id === item_id ? { ...item, quantity } : item));

                    return {
                        ...old,
                        items: updatedItems,
                    };
                });
            }

            return { previousCart };
        },
        onSuccess: () => {
            // Invalidate to get updated cart with correct totals from background task
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Cart updated");
        },
        onError: (error: any, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousCart) {
                queryClient.setQueryData<Cart>(["cart"], context.previousCart);
            }
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

            return res;
        },
        onSuccess: async (data) => {
            await deleteCookie("_cart_id");
            router.push(`/order/confirmed/${data?.order_number}`);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Order placed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to place order");
        },
    });
};
