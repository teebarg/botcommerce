import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";

import { Order } from "@/schemas";
import { currency, formatDate } from "@/lib/utils";

interface OrderCardProps {
    order: Order;
    actions?: React.ReactNode;
}

const OrderCard = ({ order, actions }: OrderCardProps) => {
    return (
        <div className="bg-content1 border border-divider rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-default-900">{order.order_number}</h3>
                    <PaymentStatusBadge status={order.payment_status} />
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-default-500">Customer</span>
                    <span className="font-medium text-default-900">
                        {order.user.first_name} {order.user.last_name}
                    </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-default-500">Date</span>
                    <span className="text-default-900">{formatDate(order.created_at)}</span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-default-500">Items</span>
                    <span className="text-default-900">{order.order_items.length} items</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                    <span className="text-default-500">Total</span>
                    <span className="font-bold text-default-900">{currency(order.total)}</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                    <span className="text-default-500">Order Status</span>
                    <OrderStatusBadge status={order.status} />
                </div>

                {actions}
            </div>
        </div>
    );
};

export default OrderCard;
