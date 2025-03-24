import { currency } from "@lib/util/util";

import { Order } from "@/lib/models";

type OrderSummaryProps = {
    order: Order;
};

const OrderSummary = ({ order }: OrderSummaryProps) => {
    const getAmount = (amount?: number | null) => {
        if (!amount) {
            return;
        }

        return currency(amount);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="text-sm text-default-900 my-2">
                <div className="flex items-center justify-between mb-2">
                    <span>Subtotal</span>
                    <span>{getAmount(order.subtotal)}</span>
                </div>
                <div className="flex flex-col gap-y-1">
                    {/* {order.discount_total > 0 && (
                        <div className="flex items-center justify-between">
                            <span>Discount</span>
                            <span>- {getAmount(order.discount_total)}</span>
                        </div>
                    )}
                    {order.gift_card_total > 0 && (
                        <div className="flex items-center justify-between">
                            <span>Discount</span>
                            <span>- {getAmount(order.gift_card_total)}</span>
                        </div>
                    )} */}
                    <div className="flex items-center justify-between">
                        <span>Delivery Fee</span>
                        <span>{getAmount(order.shipping_fee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Taxes</span>
                        <span>{getAmount(order.tax)}</span>
                    </div>
                </div>
                <div className="h-px w-full border-b border-gray-200 border-dashed my-4" />
                <div className="flex items-center justify-between font-semibold mb-2 text-base">
                    <span>Total</span>
                    <span>{getAmount(order.total)}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
