import { Order } from "@/schemas";
import { currency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const OrderSummary: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
            <h3 className="font-medium mb-3">Payment Details</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold">{order.payment_method === "CASH_ON_DELIVERY" ? "Pickup" : order.payment_method}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{currency(order.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">{currency(order.shipping_fee)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">{currency(order.tax)}</span>
                </div>
                {order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-semibold text-green-600">-{currency(order.discount_amount)}</span>
                    </div>
                )}
                <Separator />
                <div className="pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span className="font-semibold">{currency(order.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
