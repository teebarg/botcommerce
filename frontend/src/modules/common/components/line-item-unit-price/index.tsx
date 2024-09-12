import { formatAmount } from "@lib/util/prices";
import clsx from "clsx";
import { getPercentageDiff } from "@lib/util/get-precentage-diff";

type LineItemUnitPriceProps = {
    item: Omit<any, "beforeInsert">;
    region: any;
    style?: "default" | "tight";
};

const LineItemUnitPrice = ({ item, region, style = "default" }: LineItemUnitPriceProps) => {
    const originalPrice = (item.variant as CalculatedVariant).original_price;
    const hasReducedPrice = (originalPrice * item.quantity || 0) > item.total!;
    const reducedPrice = (item.total || 0) / item.quantity!;

    return (
        <div className="flex flex-col text-default-500 justify-center h-full">
            {hasReducedPrice && (
                <>
                    <p>
                        {style === "default" && <span className="text-default-400">Original: </span>}
                        <span className="line-through" data-testid="product-unit-original-price">
                            {formatAmount({
                                amount: originalPrice,
                                region: region,
                                includeTaxes: false,
                            })}
                        </span>
                    </p>
                    {style === "default" && <span className="text-blue-400">-{getPercentageDiff(originalPrice, reducedPrice || 0)}%</span>}
                </>
            )}
            <span
                className={clsx("text-base", {
                    "text-blue-400": hasReducedPrice,
                })}
                data-testid="product-unit-price"
            >
                {formatAmount({
                    amount: reducedPrice || item.unit_price || 0,
                    region: region,
                    includeTaxes: false,
                })}
            </span>
        </div>
    );
};

export default LineItemUnitPrice;
