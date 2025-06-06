import { currency } from "@lib/utils";

type LineItemPriceProps = {
    item: Omit<any, "beforeInsert">;
};

const LineItemPrice = ({ item }: LineItemPriceProps) => {
    const total = item.price * item.quantity;

    return (
        <div className="flex flex-col gap-x-2 text-default-900 items-end font-semibold">
            <div className="text-left">
                <span data-testid="product-price">{currency(total || 0)}</span>
            </div>
        </div>
    );
};

export default LineItemPrice;
