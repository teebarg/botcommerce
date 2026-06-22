import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";
import type { Order } from "@/schemas";
import { currency, formatDate } from "@/utils";
import OrderActions from "./order-actions";

interface OrderCardProps {
    order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
    return (
        <div className="border-b border-border last:border-0">
            <div className="hidden md:grid grid-cols-[140px_140px_180px_120px_140px_140px_1fr] items-center gap-4 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors">
                <p className="truncate font-medium">{order.order_number}</p>
                <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
                <p className="truncate">
                    {order.user?.first_name} {order.user?.last_name}
                </p>
                <p className="text-right font-medium">{currency(order.total)}</p>
                <div>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div>
                    <PaymentStatusBadge status={order.payment_status} />
                </div>
                <div className="justify-self-end">
                    <OrderActions order={order} />
                </div>
            </div>

            <div className="p-4 md:hidden">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <PaymentStatusBadge status={order.payment_status} />
                </div>

                <div className="space-y-1.5 text-sm mb-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer</span>
                        <span className="font-medium">
                            {order.user?.first_name} {order.user?.last_name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Items</span>
                        <span>{order.order_items.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">{currency(order.total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>

                <OrderActions order={order} />
            </div>
        </div>
    );
};

export default OrderCard;