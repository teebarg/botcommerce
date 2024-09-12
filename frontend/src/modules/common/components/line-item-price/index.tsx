import { formatAmount } from "@lib/util/prices";
import clsx from "clsx";
import { getPercentageDiff } from "@lib/util/get-precentage-diff";

type LineItemPriceProps = {
    item: Omit<any, "beforeInsert">;
    region: any;
    style?: "default" | "tight";
};

const LineItemPrice = ({ item, region, style = "default" }: LineItemPriceProps) => {
    const originalPrice = (item.variant as CalculatedVariant).original_price * item.quantity;
    const hasReducedPrice = (item.total || 0) < originalPrice;

    return (
        <div className="flex flex-col gap-x-2 text-default-500 items-end">
            <div className="text-left">
                {hasReducedPrice && (
                    <>
                        <p>
                            {style === "default" && <span className="text-default-500">Original: </span>}
                            <span className="line-through text-default-400" data-testid="product-original-price">
                                {formatAmount({
                                    amount: originalPrice,
                                    region: region,
                                    includeTaxes: false,
                                })}
                            </span>
                        </p>
                        {style === "default" && <span className="text-blue-500">-{getPercentageDiff(originalPrice, item.total || 0)}%</span>}
                    </>
                )}
                <span
                    className={clsx("text-baser", {
                        "text-blue-400": hasReducedPrice,
                    })}
                    data-testid="product-price"
                >
                    {formatAmount({
                        amount: item.total || 0,
                        region: region,
                        includeTaxes: false,
                    })}
                </span>
            </div>
        </div>
    );
};

export default LineItemPrice;
