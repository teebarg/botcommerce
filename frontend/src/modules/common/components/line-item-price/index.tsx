import clsx from "clsx";
import { currency } from "@lib/util/util";

type LineItemPriceProps = {
    item: Omit<any, "beforeInsert">;
};

const LineItemPrice = ({ item }: LineItemPriceProps) => {
    const total = item.price * item.quantity;

    return (
        <div className="flex flex-col gap-x-2 text-default-500 items-end">
            <div className="text-left">
                <span className={clsx("text-baser")} data-testid="product-price">
                    {currency(total || 0)}
                </span>
            </div>
        </div>
    );
};

export default LineItemPrice;
