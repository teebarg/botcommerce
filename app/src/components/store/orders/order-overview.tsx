import { CheckCircle, Package, Clock, RefreshCw, X, Truck } from "lucide-react";
import { Order, OrderStatus } from "@/schemas";
import { formatDate } from "@/utils";

const statusConfig: Record<OrderStatus, { icon: typeof Clock; label: string }> = {
    [OrderStatus.PENDING]: { icon: Clock, label: "Pending" },
    [OrderStatus.PROCESSING]: { icon: RefreshCw, label: "Processing" },
    [OrderStatus.SHIPPED]: { icon: Package, label: "Shipped" },
    [OrderStatus.OUT_FOR_DELIVERY]: { icon: Truck, label: "Out for delivery" },
    [OrderStatus.DELIVERED]: { icon: CheckCircle, label: "Delivered" },
    [OrderStatus.CANCELED]: { icon: X, label: "Canceled" },
    [OrderStatus.REFUNDED]: { icon: RefreshCw, label: "Refunded" },
};

export default function OrderOverview({ order }: { order: Order }) {
    const isPending = order.payment_status === "PENDING";
    const { icon: StatusIcon, label } = statusConfig[order.status] ?? statusConfig[OrderStatus.PENDING];

    return (
        <div className="rounded-xl border bg-card overflow-hidden mb-4">
            <div className="grid grid-cols-2 divide-x divide-border border-b">
                <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Order number</p>
                    <p className="text-sm font-medium truncate">{order.order_number}</p>
                </div>
                <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Order date</p>
                    <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                </div>
            </div>

            <div className="px-4 py-3 flex items-center justify-between border-b">
                <span className="text-sm text-muted-foreground">Order status</span>
                <span className="flex items-center gap-1.5 text-sm font-medium">
                    <StatusIcon className="h-3.5 w-3.5" />
                    {label}
                </span>
            </div>

            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment status</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                        {isPending ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        {isPending ? "Pending transfer" : "Completed"}
                    </span>
                </div>
                {isPending && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Your order will be processed once we receive your bank transfer payment.
                    </p>
                )}
            </div>
        </div>
    );
}