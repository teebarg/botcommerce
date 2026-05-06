import { CheckCircle, Package, Calendar, Clock, RefreshCw, X, Truck } from "lucide-react";
import { Order, OrderStatus } from "@/schemas";
import { cn, formatDate } from "@/utils";
import { ReactElement } from "react";

const OrderOverview = ({ order }: { order: Order }) => {
    const isPending = order.payment_status === "PENDING";

    const orderStatusConfig: Record<OrderStatus, { icon: ReactElement; color: string }> = {
        [OrderStatus.PENDING]: { icon: <Clock className="h-4 w-4" />, color: "text-orange-600" },
        [OrderStatus.PROCESSING]: { icon: <RefreshCw className="h-4 w-4" />, color: "text-blue-600" },
        [OrderStatus.SHIPPED]: { icon: <Package className="h-4 w-4" />, color: "text-purple-600" },
        [OrderStatus.OUT_FOR_DELIVERY]: { icon: <Truck className="h-4 w-4" />, color: "text-indigo-600" },
        [OrderStatus.DELIVERED]: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600" },
        [OrderStatus.CANCELED]: { icon: <X className="h-4 w-4" />, color: "text-red-600" },
        [OrderStatus.REFUNDED]: { icon: <RefreshCw className="h-4 w-4" />, color: "text-gray-600" },
    };

    const { icon, color } = orderStatusConfig[order.status] ?? orderStatusConfig[OrderStatus.PENDING];

    const formatOrderStatus = (status: OrderStatus) => {
        return status
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    return (
        <div className={cn("bg-card rounded-lg p-6 space-y-4 mb-4")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">Order Number:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{order.order_number}</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">Order Date:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{formatDate(order.created_at)}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    {icon}
                    <span className="font-medium">Order Status:</span>
                    <span className={`text-sm font-medium ${color}`}>{formatOrderStatus(order.status)}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    {isPending ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                    <span className="font-medium">Payment Status:</span>
                    <span className={`text-sm font-medium ${isPending ? "text-orange-600" : "text-green-600"}`}>
                        {isPending ? "Pending Transfer" : "Completed"}
                    </span>
                </div>
                {isPending && (
                    <p className="text-sm text-muted-foreground mt-2 ml-6">
                        Your order will be processed once we receive your bank transfer payment.
                    </p>
                )}
            </div>
        </div>
    );
};

export default OrderOverview;
