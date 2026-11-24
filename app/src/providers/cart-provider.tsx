import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Cart, CartItem } from "@/schemas";
import { useAddToCart, useChangeCartQuantity, useDeleteCartItem, useMyCart } from "@/hooks/useCart";

interface CartContextType {
    cart?: Cart;
    cartCount: number;
    isLoading: boolean;
    error?: any;
    addToCart: (variantId: number, quantity?: number, options?: { openCart?: boolean; optimisticItem?: CartItem }) => Promise<CartItem>;
    removeFromCart: (id: number, options?: { notify?: boolean }) => Promise<void>;
    updateQuantity: (id: number, quantity: number, options?: { openCart?: boolean; notify?: boolean }) => Promise<CartItem>;
    wishlist: number[];
    toggleWishlist: (id: number) => void;
    isWishlisted: (id: number) => boolean;
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        if (typeof window === "undefined") {
            return {
                cart: undefined,
                isLoading: true,
                error: null,
                cartCount: 0,
                addToCart: async () => undefined as unknown as CartItem,
                removeFromCart: async () => { },
                updateQuantity: async () => undefined as unknown as CartItem,
                wishlist: [],
                toggleWishlist: () => { },
                isWishlisted: () => false,
                cartOpen: false,
                setCartOpen: () => { },
            };
        }
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: cart, isLoading, error } = useMyCart();
    const { mutateAsync: addItem } = useAddToCart();
    const { mutateAsync: changeQuantity } = useChangeCartQuantity();
    const { mutateAsync: deleteItem } = useDeleteCartItem();
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [cartOpen, setCartOpen] = useState<boolean>(false);

    const addToCart = useCallback(
        async (variantId: number, quantity = 1, options: { openCart?: boolean; optimisticItem?: CartItem } = {}) => {
            const updatedCart = await addItem({ variant_id: variantId, quantity, optimisticItem: options.optimisticItem });
            if (options.openCart !== false) setCartOpen(true);
            return updatedCart;
        },
        [addItem]
    );

    const updateQuantity = useCallback(
        async (id: number, quantity = 1, options: { openCart?: boolean; notify?: boolean } = {}) => {
            const updatedCart = await changeQuantity({ item_id: id, quantity, notify: options.notify });
            if (options.openCart !== false) setCartOpen(true);
            return updatedCart;
        },
        [changeQuantity]
    );

    const removeFromCart = useCallback(
        async (id: number, options: { notify?: boolean } = {}) => {
            await deleteItem({ item_id: id, notify: options.notify });
        },
        [deleteItem]
    );

    const toggleWishlist = useCallback((id: number) => {
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const value = useMemo<CartContextType>(() => {
        const cartCount = cart?.items?.reduce((sum, item: CartItem) => sum + item.quantity, 0) || 0;

        return {
            cart,
            cartCount,
            isLoading,
            error,
            addToCart,
            removeFromCart,
            updateQuantity,
            wishlist,
            toggleWishlist,
            isWishlisted: (id: number) => wishlist.includes(id),
            cartOpen,
            setCartOpen,
        };
    }, [cart, isLoading, error, wishlist, cartOpen, addToCart, removeFromCart, updateQuantity, toggleWishlist]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
