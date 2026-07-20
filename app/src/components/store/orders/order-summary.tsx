import { PaymentMethod, type Order } from "@/schemas";
import { currency } from "@/utils";
import { Separator } from "@/components/ui/separator";

export default function OrderSummary({ order }: { order: Order }) {
    return (
        <div className="rounded-xl border bg-card p-4 mb-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Payment details</p>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-medium">{order.payment_method === PaymentMethod.CASH_ON_DELIVERY ? "Pickup" : order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{currency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{currency(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{currency(order.tax)}</span>
                </div>
                {order.discount_amount || 0 > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-accent">−{currency(order.discount_amount || 0)}</span>
                    </div>
                )}
                {order.wallet_used > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Wallet used</span>
                        <span className="font-medium text-accent">−{currency(order.wallet_used)}</span>
                    </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{currency(order.total)}</span>
                </div>
            </div>
        </div>
    );
}