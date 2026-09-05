import { Product, ProductSearch, ProductVariant } from "@/schemas";
import { currency } from "@/utils";
import { isFirstWhatsAppMessage, markFirstWhatsAppMessageSent } from "@/utils/whatsapp-message-state";

export const activeVariants = (product: ProductSearch | Product) => product?.variants?.filter((variant) => variant.inventory > 0) || [];

export const variantAvailable = (variant: ProductVariant) => variant.inventory > 0;

export const productInStock = (product: ProductSearch | Product) => activeVariants(product)?.some(variantAvailable) || false;

export const hasVariantChoice = (product: ProductSearch | Product) => product && activeVariants(product).length > 1;

export function defaultVariant(product: ProductSearch | Product): ProductVariant {
    const active = activeVariants(product);
    return active.find(variantAvailable) ?? active[0] ?? product.variants?.[0]!;
}

export function variantLabel(variant: ProductVariant) {
    const fields = [
        ["S", variant.size],
        ["Color", variant.color],
        ["W", variant.width],
        ["L", variant.length],
        ["Age", variant.age],
    ];
    return (
        fields
            .filter(([, value]) => value !== null && value !== undefined && value !== "")
            .map(([label, value]) => `${label}: ${value}`)
            .join(" · ") || variant.sku
    );
}

export function priceRange(product: ProductSearch | Product) {
    const prices = activeVariants(product).map((variant) => variant.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return { min, max, isRange: min !== max };
}

export function lowStock(variant: ProductVariant) {
    return variant.inventory > 0 && variant.inventory <= 5;
}

export function getPriceInfo(product: ProductSearch | Product) {
    const variants = product.variants ?? [];

    if (variants.length === 0) {
        return {
            minPrice: 0,
            maxPrice: 0,
            minCompareAtPrice: 0,
            maxCompareAtPrice: 0,
            hasDiscount: false,
            maxDiscountPercent: 0,
        };
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minCompareAtPrice = Infinity;
    let maxCompareAtPrice = -Infinity;
    let hasDiscount = false;

    for (const variant of variants) {
        const price = variant.price;
        const compareAtPrice = variant.old_price || price;

        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);

        minCompareAtPrice = Math.min(minCompareAtPrice, compareAtPrice);

        maxCompareAtPrice = Math.max(maxCompareAtPrice, compareAtPrice);

        if (variant.old_price && variant.old_price > variant.price) {
            hasDiscount = true;
        }
    }

    const maxDiscountPercent = maxCompareAtPrice > 0 ? Math.round(((maxCompareAtPrice - minPrice) / maxCompareAtPrice) * 100) : 0;

    return {
        minPrice,
        maxPrice,
        minCompareAtPrice,
        maxCompareAtPrice,
        hasDiscount,
        maxDiscountPercent,
    };
}

export const handleWhatsAppPurchase = (v: ProductVariant, slug: string, whatsapp: string) => {
    const label = variantLabel(v);

    const message = isFirstWhatsAppMessage()
        ? `Hi! I'd like to order:\n\n${label}\nQuantity: 1\n\n*Total: ${currency(v.price)}*\n\n${window.location.origin}/products/${slug}\n\nPlease let me know the next steps. Thank you!`
        : `${label}\nQuantity: 1\n\n*Total: ${currency(v.price)}*\n\n${window.location.origin}/products/${slug}`;

    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
    markFirstWhatsAppMessageSent();
};
