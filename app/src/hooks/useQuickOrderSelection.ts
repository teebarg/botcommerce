import { useCallback, useMemo, useState } from "react";
import type { ProductSearch, ProductVariant } from "@/schemas/product";
import type { CartItem } from "@/schemas";
import { defaultVariant, variantLabel } from "@/lib/variant";
import { useCart } from "@/providers/cart-provider";

export type SelectedItem = {
    id: number;
    variantId: number;
    cartItemId: number;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    label?: string;
    image?: string;
    variant: ProductVariant;
};

export function toSelectedItem(product: ProductSearch, variant: ProductVariant = defaultVariant(product)): Omit<SelectedItem, "cartItemId"> {
    return {
        id: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        price: variant.price,
        quantity: 1,
        label: variantLabel(variant) || undefined,
        image: product.image || undefined,
        variant,
    };
}

function fromCartItem(item: CartItem): SelectedItem {
    return {
        id: item.variant.product_id ?? -1,
        variantId: item.variant_id,
        cartItemId: item.id,
        slug: item.slug,
        name: item.name,
        price: item.variant.price,
        quantity: item.quantity,
        label: variantLabel(item.variant) || undefined,
        image: item.image,
        variant: item.variant,
    };
}

export function useQuickOrderSelection() {
    const { cart, isLoading: cartLoading, addToCart, updateQuantity, removeFromCart } = useCart();
    const [pendingCount, setPendingCount] = useState(0);
    const items = useMemo(() => (cart?.items ?? []).map(fromCartItem), [cart?.items]);
    const variantIds = useMemo(() => new Set(items.map((item) => item.variantId)), [items]);
    const isSyncing = pendingCount > 0;

    const runMutation = useCallback(async (operation: () => Promise<unknown>) => {
        setPendingCount((count) => count + 1);
        try {
            await operation();
        } finally {
            setPendingCount((count) => Math.max(0, count - 1));
        }
    }, []);

    const toggle = useCallback(async (item: Omit<SelectedItem, "cartItemId">) => {
        if (cartLoading) return;
        const existing = cart?.items?.find((cartItem) => cartItem.variant_id === item.variantId);
        if (existing) {
            await runMutation(() => removeFromCart(existing.id, { notify: false }));
            return;
        }
        const optimisticItem: CartItem = {
            id: -Date.now(),
            name: item.name,
            slug: item.slug,
            variant_id: item.variantId,
            variant: item.variant,
            image: item.image,
            quantity: 1,
        };
        await runMutation(() => addToCart(item.variantId, 1, { openCart: false, optimisticItem }));
    }, [cart, cartLoading, addToCart, removeFromCart, runMutation]);

    const remove = useCallback(async (variantId: number) => {
        const item = cart?.items?.find((cartItem) => cartItem.variant_id === variantId);
        if (!item) return;
        await runMutation(() => removeFromCart(item.id, { notify: false }));
    }, [cart, removeFromCart, runMutation]);

    const changeQuantity = useCallback(async (variantId: number, quantity: number) => {
        const item = cart?.items?.find((cartItem) => cartItem.variant_id === variantId);
        if (!item) return;
        const nextQuantity = Math.max(1, Math.floor(quantity));
        if (nextQuantity === item.quantity) return;
        await runMutation(() => updateQuantity(item.id, nextQuantity, { openCart: false, notify: false }));
    }, [cart, updateQuantity, runMutation]);

    const clear = useCallback(async () => {
        const cartItems = [...(cart?.items ?? [])];
        if (!cartItems.length) return;
        await runMutation(async () => {
            for (const item of cartItems) {
                await removeFromCart(item.id, { notify: false });
            }
        });
    }, [cart?.items, removeFromCart, runMutation]);

    return { items, variantIds, toggle, remove, updateQuantity: changeQuantity, clear, isSyncing, cartLoading };
}
