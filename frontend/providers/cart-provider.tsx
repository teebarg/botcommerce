"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/apis/client";
import { addToOfflineCart, clearOfflineCart, getOfflineCart } from "@/lib/indexeddb/offline-cart";
import { getCookie } from "@/lib/util/server-utils";
import { setCookie } from "@/lib/util/cookie";
import { Cart } from "@/schemas";

type AddItem = {
    variant_id: number;
    quantity: number;
};

interface CartContextType {
    addItem: (item: AddItem) => Promise<void>;
    syncOfflineCart: () => Promise<void>;
    isSyncing: boolean;
    cart?: Cart;
    isLoading: boolean;
    error?: any;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const {
        data: cart,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            return await api.get<Cart>("/cart/");
        },
    });

    // const loadCart = async () => {
    //     setIsLoading(true);
    //     try {
    //         const [cartRes, itemRes] = await Promise.all([
    //             navigator.onLine ? api.get<Cart>("/cart/") : Promise.resolve(null),
    //             navigator.onLine ? api.get<CartItem[]>("/cart/items") : getOfflineCart(),
    //         ]);

    //         if (cartRes) setCart(cartRes);
    //         setCartItems(itemRes || []);
    //     } catch (e) {
    //         toast.error("Failed to load cart");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     loadCart();
    // }, []);

    const addItem = async (item: AddItem) => {
        if (!navigator.onLine) {
            await addToOfflineCart(item);
            toast.success("Added to cart (offline)");

            return;
        }

        // try {
        //     const res = await api.post<Cart>("/cart/items", item);
        //     const id = await getCookie("_cart_id");

        //     if (!id && res.cart_number) {
        //         await setCookie("_cart_id", res.cart_number);
        //     }

        //     queryClient.invalidateQueries({ queryKey: ["cart"] });
        //     toast.success("Added to cart");
        // } catch (e: any) {
        //     toast.error(e.message || "Failed to add to cart");
        // }
    };

    const syncOfflineCart = async () => {
        const offlineCart = await getOfflineCart();

        if (offlineCart.length === 0) return;

        setIsSyncing(true);
        try {
            for (const item of offlineCart) {
                await api.post<Cart>("/cart/items", item);
            }
            await clearOfflineCart();
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Offline cart synced");
        } catch (err) {
            toast.error("Failed to sync offline cart");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const handleReconnect = () => {
            if (navigator.onLine) syncOfflineCart();
        };

        window.addEventListener("online", handleReconnect);

        return () => window.removeEventListener("online", handleReconnect);
    }, []);

    return (
        <CartContext.Provider
            value={{
                addItem,
                syncOfflineCart,
                isSyncing,
                cart,
                isLoading,
                error,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
