// lib/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/apis/client";
import { Address, BankDetails, Cart, CartItem, PaginatedProductSearch, Review, User, Wishlist } from "@/types/models";

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
            return await api.get<BankDetails[]>("/bank-details/");
        },
        enabled: typeof window !== "undefined", // prevent server fetch
        // enabled: !!cartId, // prevents running when cartId is null
    });
};

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/");
        },
        // enabled: !!cartId, // prevents running when cartId is null
    });
};

export const useCartItem = () => {
    return useQuery({
        queryKey: ["cart-items"],
        queryFn: async () => {
            return await api.get<CartItem[]>("/cart/items");
        },
        // enabled: !!cartId, // prevents running when cartId is null
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

export const useProductReviews = (productId: number) => {
    return useQuery({
        queryKey: ["product-reviews", productId],
        queryFn: async () => await api.get<Review[]>(`/product/${productId}/reviews`),
        enabled: !!productId, // prevents running when productId is null
    });
};

export const useUserWishlist = () => {
    return useQuery({
        queryKey: ["user-wishlist"],
        queryFn: async () => await api.get<Wishlist>(`/users/wishlist`),
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
        queryFn: async () => await api.get<PaginatedProductSearch>(`/product/search`),
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

export const useInvalidate = () => {
    const queryClient = useQueryClient();

    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };

    return invalidate;
};
