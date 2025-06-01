import { getPercentageDiff } from "@lib/util/get-precentage-diff";
import { currency } from "@lib/util/util";

import { cn } from "@/lib/utils";

type LineItemUnitPriceProps = {
    item: Omit<any, "beforeInsert">;
    style?: "default" | "tight";
};

const LineItemUnitPrice = ({ item, style = "default" }: LineItemUnitPriceProps) => {
    const originalPrice = item.price;
    const hasReducedPrice = (originalPrice * item.quantity || 0) > item.total!;
    const reducedPrice = (item.total || 0) / item.quantity!;

    return (
        <div className="flex flex-col text-default-900 justify-center h-full">
            {hasReducedPrice && (
                <>
                    <p>
                        {style === "default" && <span className="text-default-500">Original: </span>}
                        <span className="line-through" data-testid="product-unit-original-price">
                            {currency(originalPrice)}
                        </span>
                    </p>
                    {style === "default" && <span className="text-blue-400">-{getPercentageDiff(originalPrice, reducedPrice || 0)}%</span>}
                </>
            )}
            <span
                className={cn("text-base", {
                    "text-blue-400": hasReducedPrice,
                })}
                data-testid="product-unit-price"
            >
                {currency(originalPrice)}
            </span>
        </div>
    );
};

export default LineItemUnitPrice;
