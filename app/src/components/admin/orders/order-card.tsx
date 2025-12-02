import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";

import { Order } from "@/schemas";
import { currency, formatDate } from "@/lib/utils";

interface OrderCardProps {
    order: Order;
    actions?: React.ReactNode;
}

const OrderCard = ({ order, actions }: OrderCardProps) => {
    return (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="p-4">
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

                {actions}
            </div>
        </div>
    );
};

export default OrderCard;
