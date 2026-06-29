import { useMemo } from "react";
import { useCart } from "@/providers/cart-provider";
import { CartItem } from "@/schemas";

export const useCartSummary = () => {
    const { cart } = useCart();

    return useMemo(() => {
        const items = cart?.items ?? [];

        const subtotal = cart?.subtotal ??
            items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

        const discountAmount = cart?.discount_amount ?? 0;

        const shippingFee = cart?.shipping_fee ?? 0;

        const tax = cart?.tax ?? 0;

        const total = cart?.total ??
            subtotal -
            discountAmount +
            shippingFee +
            tax;

        const totalItems = items.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0
        );

        return {
            subtotal,
            discountAmount,
            shippingFee,
            tax,
            total,
            totalItems,
        };
    }, [cart]);
};