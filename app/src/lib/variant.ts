import { Product, ProductOption, ProductSearch, ProductVariant } from "@/schemas";
import { currency } from "@/utils";
import { isFirstWhatsAppMessage, markFirstWhatsAppMessageSent } from "@/utils/whatsapp-message-state";

export const activeVariants = (product: ProductSearch | Product) => product?.variants?.filter((variant) => variant.inventory > 0) || [];

export const variantAvailable = (variant: ProductVariant) => variant.inventory > 0;

export function defaultVariant(product: ProductSearch | Product): ProductVariant {
    const active = activeVariants(product);
    return active.find(variantAvailable) ?? active[0] ?? product.variants?.[0]!;
}

export function variantAttributes(variant: ProductVariant): Record<string, string> {
    if (variant.attributes && Object.keys(variant.attributes).length > 0) {
        return variant.attributes;
    }

    // Legacy fallback for variants created before custom attributes were introduced.
    return Object.fromEntries(
        [
            ["Size", variant.size],
            ["Color", variant.color],
            ["Width", variant.width],
            ["Length", variant.length],
            ["Age", variant.age],
        ].filter(([, value]) => value !== null && value !== undefined && value !== "").map(([key, value]) => [key, String(value)]),
    );
}

// Saved options are the source of truth. Search results indexed before options
// were stored fall back to the choices found on the live variants.
export function productOptions(product: ProductSearch | Product): ProductOption[] {
    if (product.options?.length) return product.options;

    const derived = new Map<string, string[]>();
    for (const variant of product.variants ?? []) {
        for (const [name, value] of Object.entries(variantAttributes(variant))) {
            const values = derived.get(name) ?? [];
            if (!values.includes(value)) values.push(value);
            derived.set(name, values);
        }
    }
    return [...derived].map(([name, values]) => ({ name, values }));
}

export function variantLabel(variant: ProductVariant) {
    const details = Object.entries(variantAttributes(variant))
        .filter(([, value]) => value != null && String(value).trim() !== "")
        .map(([name, value]) => `${name}: ${String(value).trim()}`);

    return details.join(" · ");
}

export type PriceInfo = ReturnType<typeof getPriceInfo>;

export function getPriceInfo(product: { variants?: ProductVariant[] | null }) {
    const all = product.variants ?? [];

    const inStockVariants = all.filter((variant) => variant.inventory > 0);
    const variants = inStockVariants.length > 0 ? inStockVariants : all;

    if (variants.length === 0) {
        return {
            minPrice: 0,
            maxPrice: 0,
            minCompareAtPrice: 0,
            maxCompareAtPrice: 0,
            cheapestCompareAtPrice: 0,
            cheapestHasDiscount: false,
            hasDiscount: false,
            maxDiscountPercent: 0,
            discountLabel: "",
            isRange: false,
            inStock: false,
        };
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minCompareAtPrice = Infinity;
    let maxCompareAtPrice = -Infinity;
    let cheapestCompareAtPrice = 0;
    let maxDiscountPercent = 0;
    const percents: number[] = [];

    for (const variant of variants) {
        const price = variant.price;
        // An old price only counts when it is higher than the current price.
        const compareAtPrice = variant.old_price && variant.old_price > price ? variant.old_price : price;
        const percent = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

        maxPrice = Math.max(maxPrice, price);
        minCompareAtPrice = Math.min(minCompareAtPrice, compareAtPrice);
        maxCompareAtPrice = Math.max(maxCompareAtPrice, compareAtPrice);
        maxDiscountPercent = Math.max(maxDiscountPercent, percent);
        percents.push(percent);

        if (price < minPrice || (price === minPrice && compareAtPrice > cheapestCompareAtPrice)) {
            minPrice = price;
            cheapestCompareAtPrice = compareAtPrice;
        }
    }

    const hasDiscount = maxDiscountPercent > 0;
    const discountVaries = percents.some((percent) => percent !== maxDiscountPercent);

    return {
        minPrice,
        maxPrice,
        minCompareAtPrice,
        maxCompareAtPrice,
        cheapestCompareAtPrice,
        cheapestHasDiscount: cheapestCompareAtPrice > minPrice,
        hasDiscount,
        maxDiscountPercent,
        discountLabel: !hasDiscount ? "" : discountVaries ? `Up to -${maxDiscountPercent}%` : `-${maxDiscountPercent}%`,
        isRange: minPrice !== maxPrice,
        inStock: inStockVariants.length > 0,
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
