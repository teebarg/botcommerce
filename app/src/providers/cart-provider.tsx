import { createContext, useContext, useMemo } from "react";
import type { Cart } from "@/schemas";
import { useMyCart } from "@/hooks/useCart";

interface CartContextType {
    cart?: Cart;
    isLoading: boolean;
    error?: any;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
    const context = useContext(CartContext);
    
    if (!context) {
        if (typeof window === "undefined") {
            return { cart: undefined, isLoading: true, error: null };
        }
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: cart, isLoading, error } = useMyCart();

    const value = useMemo(() => ({
        cart,
        isLoading,
        error
    }), [cart, isLoading, error]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
