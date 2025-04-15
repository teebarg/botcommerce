// lib/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/apis/base";
import { Address, BankDetails, Cart, CartItem, PaginatedProductSearch, Review, User } from "@/types/models";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            return await api.get<User>("/users/me");
        },
        enabled: typeof window !== "undefined", // prevent server fetch
    });
};

export const useBank = () => {
    return useQuery({
        queryKey: ["bank"],
        queryFn: async () => {
            return await api.get<BankDetails[]>("/bank-details/", { cache: "default" });
        },
        enabled: typeof window !== "undefined", // prevent server fetch
        // enabled: !!cartId, // prevents running when cartId is null
    });
};

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/", { cache: "default" });
        },
        // enabled: !!cartId, // prevents running when cartId is null
    });
};

export const useCartItem = () => {
    return useQuery({
        queryKey: ["cart-items"],
        queryFn: async () => {
            return await api.get<CartItem[]>("/cart/items", { cache: "default" });
        },
        // enabled: !!cartId, // prevents running when cartId is null
    });
};

export const useAddress = (addressId: number) => {
    return useQuery({
        queryKey: ["cart-address", addressId],
        queryFn: async () => {
            const res = await api.get<Address>(`/address/${addressId}`, { cache: "default" });

            return res;
        },
        enabled: !!addressId, // prevents running when addressId is null
    });
};

export const useUserAddresses = () => {
    return useQuery({
        queryKey: ["user-address"],
        queryFn: async () => {
            const res = await api.get<{ addresses: Address[] }>(`/users/address`, { cache: "default" });

            return res;
        },
    });
};

export const useProductReviews = (productId: number) => {
    return useQuery({
        queryKey: ["product-reviews", productId],
        queryFn: async () => await api.get<Review[]>(`/product/${productId}/reviews`, { cache: "default" }),
        enabled: !!productId, // prevents running when productId is null
    });
};

interface SearchParams {
    query?: string;
    categories?: string;
    collections?: string;
    min_price?: number | string;
    max_price?: number | string;
    page?: number;
    limit?: number;
    sort?: string;
}

export const useProductSearch = (searchParams: SearchParams) => {
    return useQuery({
        queryKey: ["product-search", searchParams],
        queryFn: async () => await api.get<PaginatedProductSearch>(`/product/search`, { cache: "default" }),
        enabled: !!searchParams, // prevents running when searchParams is null
    });
};

export const useUpdateCartItem = (cartId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            const res = await fetch(`${baseURL}/api/cart/${cartId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            if (!res.ok) throw new Error("Failed to update cart item");

            return res.json();
        },
        onSuccess: () => {
            // Invalidate to refetch updated cart
            queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
        },
    });
};

export const useInvalidateCart = () => {
    const queryClient = useQueryClient();

    const invalidateCart = () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
    };

    return invalidateCart;
};

export const useInvalidateCartItem = () => {
    const queryClient = useQueryClient();

    const invalidateCart = () => {
        queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    };

    return invalidateCart;
};

export const useInvalidateProductReviews = () => {
    const queryClient = useQueryClient();

    const invalidateProductReviews = () => {
        queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    };

    return invalidateProductReviews;
};
