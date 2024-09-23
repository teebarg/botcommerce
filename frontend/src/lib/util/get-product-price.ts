import { currency } from "./util";

export function getProductPrice({ product, variantId }: { product: any; variantId?: string; }) {
    if (!product || !product.id) {
        throw new Error("No product provided");
    }

    const getPercentageDiff = (original: number, calculated: number) => {
        const diff = original - calculated;
        const decrease = (diff / original) * 100;

        return decrease.toFixed();
    };

    const cheapestPrice = () => {
        if (!product || !product.variants?.length) {
            return null;
        }

        const variants = product.variants as unknown as any[];

        const cheapestVariant = variants.reduce((prev, curr) => {
            return prev.calculated_price < curr.calculated_price ? prev : curr;
        });

        return {
            calculated_price_number: cheapestVariant.calculated_price,
            calculated_price: currency(cheapestVariant.calculated_price),
            original_price_number: cheapestVariant.original_price,
            original_price: currency(cheapestVariant.original_price),
            price_type: cheapestVariant.calculated_price_type,
            percentage_diff: getPercentageDiff(cheapestVariant.original_price, cheapestVariant.calculated_price),
        };
    };

    const variantPrice = () => {
        if (!product || !variantId) {
            return null;
        }

        const variant = product.variants.find((v: any) => v.id === variantId || v.sku === variantId) as unknown as any;

        if (!variant) {
            return null;
        }

        return {
            calculated_price_number: variant.calculated_price,
            calculated_price: currency(variant.calculated_price),
            original_price_number: variant.original_price,
            original_price: currency(variant.original_price),
            price_type: variant.calculated_price_type,
            percentage_diff: getPercentageDiff(variant.original_price, variant.calculated_price),
        };
    };

    return {
        product,
        cheapestPrice: cheapestPrice(),
        variantPrice: variantPrice(),
    };
}
