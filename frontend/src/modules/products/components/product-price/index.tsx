import clsx from "clsx";
import { getProductPrice } from "@lib/util/get-product-price";

export default function ProductPrice({ product, variant, region }: { product: any; variant?: any; region: any }) {
    const { cheapestPrice, variantPrice } = getProductPrice({
        product,
        variantId: variant?.id,
        region,
    });

    const selectedPrice = variant ? variantPrice : cheapestPrice;

    if (!selectedPrice) {
        return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />;
    }

    return (
        <div className="flex flex-col text-default-800">
            <span
                className={clsx("text-xl", {
                    "text-blue-400": selectedPrice.price_type === "sale",
                })}
            >
                {!variant && <span className="text-sm">From </span>}
                <span data-testid="product-price" data-value={selectedPrice.calculated_price_number}>
                    {selectedPrice.calculated_price}
                </span>
            </span>
            {selectedPrice.price_type === "sale" && (
                <>
                    <p>
                        <span className="text-default-500">Original: </span>
                        <span className="line-through" data-testid="original-product-price" data-value={selectedPrice.original_price_number}>
                            {selectedPrice.original_price}
                        </span>
                    </p>
                    <span className="text-blue-400">-{selectedPrice.percentage_diff}%</span>
                </>
            )}
        </div>
    );
}
