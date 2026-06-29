import { useMemo } from "react";
import type { ProductSearch } from "@/schemas/product";
import { currency } from "@/utils";
import { useAddToCart, useChangeCartQuantity } from "./useCart";
import { useConfig } from "@/providers/store-provider";
import { useCart } from "@/providers/cart-provider";
import { isFirstWhatsAppMessage, markFirstWhatsAppMessageSent } from "@/utils/whatsapp-message-state";
import { toast } from "sonner";

export const useProductCardVariant = (product: ProductSearch) => {
    const { cart } = useCart();
    const { whatsapp } = useConfig();
    const { mutateAsync: addToCart, isPending: creating } = useAddToCart();
    const { mutateAsync: updateQuantity, isPending: updating } = useChangeCartQuantity();

    const loading = creating || updating;

    const firstInStockVariant = useMemo(
        () => product?.variants?.find((v) => v.inventory > 0) ?? product?.variants?.[0],
        [product?.variants]
    );

    const outOfStock = useMemo(
        () => !product?.variants?.length || product.variants.every((v) => v.inventory <= 0),
        [product?.variants]
    );

    const priceInfo = useMemo(() => {
        const variants = product?.variants ?? [];
        const prices = variants.map((v) => v.price);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxCompareAtPrice = Math.max(...variants.map((v) => v.old_price || v.price));
        const hasDiscount = variants.some((v) => v.old_price && v.old_price > v.price);
        const maxDiscountPercent = hasDiscount
            ? Math.round(((maxCompareAtPrice - minPrice) / maxCompareAtPrice) * 100)
            : 0;
        return { minPrice, maxCompareAtPrice, hasDiscount, maxDiscountPercent };
    }, [product?.variants]);

    const handleAddToCart = () => {
        if (!firstInStockVariant) return;
        const variantInCart = cart?.items?.find((item) => item.variant_id === firstInStockVariant.id);
        if (variantInCart) {
            if (variantInCart?.quantity >= variantInCart?.variant.inventory) {
                toast.error(`You can only add ${variantInCart.variant.inventory} items`)
                return
            }
            updateQuantity({ item_id: variantInCart.id, quantity: variantInCart.quantity + 1 })
            return;
        }
        addToCart({ variant_id: firstInStockVariant.id, quantity: 1 });
    };

    const handleWhatsAppPurchase = () => {
        if (!firstInStockVariant) return;
        const v = firstInStockVariant;
        const variantInfo = [
            v.size && `Size: ${v.size}`,
            v.color && `Color: ${v.color}`,
            v.width && `Waist: ${v.width}`,
            v.length && `Length: ${v.length}`,
            v.age && `Age: ${v.age}`,
            `Price: ${currency(v.price)}`,
        ].filter(Boolean).join("\n");

        const message = isFirstWhatsAppMessage()
            ? `Hi! I'd like to order:\n\n${variantInfo}\nQuantity: 1\n\n*Total: ${currency(v.price)}*\n\n${window.location.origin}/products/${product.slug}\n\nPlease let me know the next steps. Thank you!`
            : `${variantInfo}\nQuantity: 1\n\n*Total: ${currency(v.price)}*\n\n${window.location.origin}/products/${product.slug}`;

        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
        markFirstWhatsAppMessageSent();
    };

    return { priceInfo, outOfStock, handleAddToCart, handleWhatsAppPurchase, loading };
};