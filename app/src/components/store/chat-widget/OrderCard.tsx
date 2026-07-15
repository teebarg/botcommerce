import { Package, Truck, CheckCircle2, RotateCcw, LucideIcon, XCircle } from "lucide-react";
import { currency } from "@/utils";
import { ChatOrder, OrderStatus } from "@/schemas";

const statusConfig: Record<OrderStatus, { icon: LucideIcon; label: string; color: string; bg: string; progress: number }> = {
    [OrderStatus.PENDING]: { icon: Package, label: "Pending", color: "text-warning", bg: "bg-warning/10", progress: 15 },
    [OrderStatus.PROCESSING]: { icon: Package, label: "Processing", color: "text-accent", bg: "bg-accent/10", progress: 25 },
    [OrderStatus.SHIPPED]: { icon: Truck, label: "Shipped", color: "text-blue-400", bg: "bg-blue-400/10", progress: 60 },
    [OrderStatus.OUT_FOR_DELIVERY]: { icon: Truck, label: "Out for Delivery", color: "text-success-foreground", bg: "bg-success", progress: 80 },
    [OrderStatus.DELIVERED]: { icon: CheckCircle2, label: "Delivered", color: "text-success", bg: "bg-success/10", progress: 100 },
    [OrderStatus.CANCELED]: { icon: XCircle, label: "Canceled", color: "text-destructive", bg: "bg-destructive/10", progress: 100 },
    [OrderStatus.REFUNDED]: { icon: RotateCcw, label: "Refunded", color: "text-destructive-foreground", bg: "bg-destructive", progress: 100 },
};

export const OrderCard = ({ order }: { order: ChatOrder | null }) => {
    if (!order) return null;

    const config = statusConfig[order.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
        <div className="bg-card rounded-2xl p-4 space-y-3 max-w-xs animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">#{order.order_number}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                </span>
            </div>

            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-primary transition-[width] duration-700 ease-out"
                    style={{ width: `${config.progress}%` }}
                />
            </div>

            <div className="space-y-1">
                {order.items.map((item, i) => (
                    <p key={i} className="text-sm text-foreground">
                        {item.name}
                    </p>
                ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-foreground">{currency(order.financials.total)}</span>
            </div>
        </div>
    );
};
