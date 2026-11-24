import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Cart, CartItem, CartUpdate, Message, Order } from "@/schemas";
import { api } from "@/utils/api";

export const useMyCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: () => api.get<Cart>("/cart/"),
        staleTime: 0,
        refetchOnMount: false,
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ variant_id, quantity }: { variant_id: number; quantity: number; optimisticItem?: CartItem }) =>
            await api.post<CartItem>("/cart/items", { variant_id, quantity }),
        onMutate: async (variables: { variant_id: number; quantity: number; optimisticItem?: CartItem }) => {
            const { variant_id, quantity } = variables;
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            const previousCart = queryClient.getQueryData<Cart>(["cart"]);

            if (previousCart) {
                queryClient.setQueryData<Cart>(["cart"], (old) => {
                    if (!old) return old;

                    const existingItemIndex = old?.items?.findIndex((item) => item.variant_id === variant_id);

                    if (existingItemIndex >= 0) {
                        const updatedItems = [...old.items];

                        updatedItems[existingItemIndex] = {
                            ...updatedItems[existingItemIndex],
                            quantity: updatedItems[existingItemIndex].quantity + quantity,
                        };

                        return {
                            ...old,
                            items: updatedItems,
                        };
                    } else if (variables.optimisticItem) {
                        return { ...old, items: [...old.items, variables.optimisticItem] };
                    } else {
                        return old;
                    }
                });
            }

            return { previousCart };
        },
        onSuccess: async (addedItem) => {
            queryClient.setQueryData<Cart>(["cart"], (old) => {
                if (!old) return old;
                const existingIndex = old.items.findIndex((item) => item.variant_id === addedItem.variant_id);
                if (existingIndex >= 0) {
                    const items = [...old.items];
                    items[existingIndex] = addedItem;
                    return { ...old, items };
                }
                return { ...old, items: [...old.items, addedItem] };
            });
            await queryClient.invalidateQueries({ queryKey: ["cart"] });
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
        mutationFn: async ({ item_id, quantity }: { item_id: number; quantity: number; notify?: boolean }) =>
            await api.put<CartItem>(`/cart/items/${item_id}?quantity=${quantity}`, {}),
        onMutate: async ({ item_id, quantity }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });

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
        onSuccess: async (_data, variables) => {
            if (variables.notify !== false) toast.success("Cart updated");
            await queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: any, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData<Cart>(["cart"], context.previousCart);
            }
            toast.error(error.message || "Failed to update cart");
        },
    });
};

export const useUpdateCartDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (update: CartUpdate) => await api.put<Cart>("/cart/", update),
        onSuccess: () => {
            toast.success("Cart details updated");
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update cart details");
        },
    });
};

export const useDeleteCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ item_id }: { item_id: number; notify?: boolean }) => await api.delete<Message>(`/cart/items/${item_id}`),
        onMutate: async ({ item_id }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });
            const previousCart = queryClient.getQueryData<Cart>(["cart"]);
            if (previousCart) {
                queryClient.setQueryData<Cart>(["cart"], (old) => old ? { ...old, items: old.items.filter((item) => item.id !== item_id) } : old);
            }
            return { previousCart };
        },
        onSuccess: async (_data, variables) => {
            if (variables.notify !== false) toast.success("Item removed from cart");
            await queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: any, _variables, context) => {
            if (context?.previousCart) queryClient.setQueryData<Cart>(["cart"], context.previousCart);
            toast.error(error.message || "Failed to remove item");
        },
    });
};

export const usePlaceOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post<Order>("/order/"),
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            if (data.payment_method == "BANK_TRANSFER") {
                window.location.href = `/order/confirmed/${data?.order_number}`;
                return;
            }

            const payment: any = await api.post(`/payment/initialize/${data.id}`);
            window.location.href = payment?.authorization_url;
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to place order");
        },
    });
};

export const useApplyWalletCredit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => api.post<Message>("/cart/apply-wallet", {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Wallet credit applied");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to apply wallet credit");
        },
    });
};

export const useRemoveWalletCredit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => api.post<Message>("/cart/remove-wallet", {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Wallet credit removed");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to remove wallet credit");
        },
    });
};
