import { Clock, CheckCircle, AlertTriangle, Truck } from "lucide-react";
import { format } from "date-fns";

import { Order } from "@/types/models";
import { currency } from "@/lib/utils";

interface OrderCardProps {
    order: Order;
    actions?: React.ReactNode;
}

const OrderCard = ({ order, actions }: OrderCardProps) => {
    const statusConfig: Record<
        "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED" | "PAID" | "REFUNDED",
        { color: string; icon: any; label: string }
    > = {
        PAID: {
            color: "bg-success/20 text-success",
            icon: CheckCircle,
            label: "Paid",
        },
        REFUNDED: {
            color: "bg-danger/20 text-danger",
            icon: AlertTriangle,
            label: "Refunded",
        },
        PENDING: {
            color: "bg-warning/20 text-warning",
            icon: AlertTriangle,
            label: "Pending",
        },
        PROCESSING: {
            color: "bg-primary/20 text-primary",
            icon: Clock,
            label: "Processing",
        },
        SHIPPED: {
            color: "bg-blue-100 text-blue-700",
            icon: Truck,
            label: "Shipped",
        },
        DELIVERED: {
            color: "bg-success/20 text-success",
            icon: CheckCircle,
            label: "Delivered",
        },
        CANCELED: {
            color: "bg-danger/20 text-danger",
            icon: AlertTriangle,
            label: "Cancelled",
        },
    };

    const config = statusConfig[order.status];
    const StatusIcon = config.icon;

    return (
        <div className="bg-content1 border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-default-900">{order.order_number}</h3>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="mr-1" size={14} />
                        {config.label}
                    </div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-default-500">Customer</span>
                    <span className="font-medium text-default-900">
                        {order.user.first_name} {order.user.last_name}
                    </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-default-500">Date</span>
                    <span className="text-default-900">{format(new Date(order.created_at), "MMM d, yyyy")}</span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-default-500">Items</span>
                    <span className="text-default-900">{order.order_items.length} items</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                    <span className="text-default-500">Total</span>
                    <span className="font-bold text-default-900">{currency(order.total)}</span>
                </div>

                {actions}
            </div>
        </div>
    );
};

export default OrderCard;
