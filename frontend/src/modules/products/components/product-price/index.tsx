import clsx from "clsx";
import { getProductPrice } from "@lib/util/get-product-price";

export default function ProductPrice({ product, variant }: { product: any; variant?: any; }) {


    const selectedPrice = product.price;

    if (!selectedPrice) {
        return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />;
    }

    return (
        <div className="flex flex-col text-default-800">
            <span
                className={clsx("text-xl", {
                    "text-blue-400": product.old_price,
                })}
            >
                <span className="text-sm">From </span>
                <span data-testid="product-price" data-value={selectedPrice}>
                    {selectedPrice}
                </span>
            </span>
            {product.old_price && (
                <>
                    <p>
                        <span className="text-default-500">Original: </span>
                        <span className="line-through" data-testid="original-product-price" data-value={product.price}>
                            {product.old_price}
                        </span>
                    </p>
                    {/* <span className="text-blue-400">-{selectedPrice.percentage_diff}%</span> */}
                </>
            )}
        </div>
    );
}
