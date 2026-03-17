import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Cart, CartComplete, CartUpdate, Message, Order } from "@/schemas";
import { useNavigate } from "@tanstack/react-router";
import { clientApi } from "@/utils/api.client";

export const useMyCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: () => clientApi.get<Cart>("/cart/"),
        staleTime: 0,
        refetchOnMount: false,
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ variant_id, quantity }: { variant_id: number; quantity: number }) =>
            await clientApi.post<Cart>("/cart/items", { variant_id, quantity }),
        onMutate: async ({ variant_id, quantity }) => {
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
                    } else {
                        return old;
                    }
                });
            }

            return { previousCart };
        },
        onSuccess: () => {
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
        mutationFn: async ({ item_id, quantity }: { item_id: number; quantity: number }) =>
            await clientApi.put<Cart>(`/cart/items/${item_id}?quantity=${quantity}`, {}),
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Cart updated");
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
        mutationFn: async (update: CartUpdate) => await clientApi.put<Cart>("/cart/", update),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] })
            queryClient.invalidateQueries({ queryKey: ["cart"] })
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
        mutationFn: async (item_id: number) => await clientApi.delete<Message>(`/cart/items/${item_id}`),
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
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (complete: CartComplete) => await clientApi.post<Order>("/order/", complete),
        onSuccess: async (data) => {
            navigate({ to: `/order/confirmed/${data?.order_number}`, replace: true });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            // analytics.checkout({
            //     cart_value: data?.total,
            //     item_count: data?.order_items?.length,
            // });
        },
        onError: (error: any) => {
            navigate({ to: "/cart" }); // send them back
            toast.error(error.message || "Failed to place order");
        },
    });
};

export const useApplyWalletCredit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => clientApi.post<Message>("/cart/apply-wallet", {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
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
        mutationFn: async () => clientApi.post<Message>("/cart/remove-wallet", {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Wallet credit removed");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to remove wallet credit");
        },
    });
};

export const useInvalidateCart = () => {
    const queryClient = useQueryClient();
    const invalidate = () => {
        queryClient.removeQueries({ queryKey: ["cart"] });
    };

    return invalidate;
};
