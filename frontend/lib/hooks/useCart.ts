import { useQuery } from "@tanstack/react-query";

import { api } from "@/apis/client";
import { Address, Cart, CartItem } from "@/schemas";

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/");
        },
        // enabled: !!cartId, // prevents running when cartId is null
    });
};

export const useCheckoutCart = () => {
    return useQuery({
        queryKey: ["checkout-cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/checkout");
        },
    });
};

export const useCartItem = () => {
    return useQuery({
        queryKey: ["cart-items"],
        queryFn: async () => {
            return await api.get<CartItem[]>("/cart/items");
        },
    });
};

export const useAddress = (addressId: number) => {
    return useQuery({
        queryKey: ["cart-address", addressId],
        queryFn: async () => await api.get<Address>(`/address/${addressId}`),
        enabled: !!addressId, // prevents running when addressId is null
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
