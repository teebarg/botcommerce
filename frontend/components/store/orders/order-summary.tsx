import { Order } from "@/types/models";
import { currency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Address & Payment Summary Component
const OrderSummary: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
            <h3 className="font-medium text-default-900 mb-3">Payment Details</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-default-500">Payment Method</span>
                    <span className="text-default-900 font-semibold">{order.payment_method}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-default-500">Subtotal</span>
                    <span className="text-default-900 font-semibold">{currency(order.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-default-500">Shipping</span>
                    <span className="text-default-900 font-semibold">{currency(order.shipping_fee)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-default-500">Tax</span>
                    <span className="text-default-900 font-semibold">{currency(order.tax)}</span>
                </div>
                <Separator />
                <div className="pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                        <span className="text-default-900">Total</span>
                        <span className="text-default-900 font-semibold">{currency(order.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
