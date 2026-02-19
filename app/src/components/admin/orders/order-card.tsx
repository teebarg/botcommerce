import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";
import type { Order } from "@/schemas";
import { currency, formatDate } from "@/utils";
import OrderActions from "./order-actions";

interface OrderCardProps {
    order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
    return (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden md:even:bg-background">
            <div className="hidden md:grid grid-cols-[140px_180px_200px_120px_140px_160px_1fr] items-center gap-4 px-4 text-sm py-2">
                <p className="truncate">{order.order_number}</p>

                <p>{formatDate(order.created_at)}</p>

                <p className="truncate">
                    {order.user?.first_name} {order.user?.last_name}
                </p>

                <p className="text-right">{currency(order.total)}</p>

                <div className="justify-self-start">
                    <OrderStatusBadge status={order.status} />
                </div>
                <div className="justify-self-start">
                    <PaymentStatusBadge status={order.payment_status} />
                </div>
                <div>
                    <OrderActions order={order} />
                </div>
            </div>
            <div className="p-4 md:hidden">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{order.order_number}</h3>
                    <PaymentStatusBadge status={order.payment_status} />
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">
                        {order.user?.first_name} {order.user?.last_name}
                    </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Date</span>
                    <span>{formatDate(order.created_at)}</span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Items</span>
                    <span>{order.order_items.length} items</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{currency(order.total)}</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Order Status</span>
                    <OrderStatusBadge status={order.status} />
                </div>

                <OrderActions order={order} />
            </div>
        </div>
    );
};

export default OrderCard;
