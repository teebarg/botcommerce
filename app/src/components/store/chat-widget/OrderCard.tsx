import { Package, Truck, CheckCircle2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { currency } from "@/utils";
import { ChatOrder } from "@/schemas";

const statusConfig = {
    PENDING: { icon: Package, label: "Pending", color: "text-accent-subtle", bg: "bg-accent-subtle/10", progress: 15 },
    PROCESSING: { icon: Package, label: "Processing", color: "text-accent", bg: "bg-accent/10", progress: 25 },
    SHIPPED: { icon: Truck, label: "Shipped", color: "text-blue-400", bg: "bg-blue-400/10", progress: 60 },
    OUT_FOR_DELIVERY: { icon: Truck, label: "Out for Delivery", color: "text-warning", bg: "bg-warning/10", progress: 80 },
    DELIVERED: { icon: CheckCircle2, label: "Delivered", color: "text-success", bg: "bg-success/10", progress: 100 },
    RETURNED: { icon: RotateCcw, label: "Returned", color: "text-destructive", bg: "bg-destructive/10", progress: 100 },
};

export const OrderCard = ({ order }: { order: ChatOrder | null }) => {
    if (!order) return null;

    const config = statusConfig[order.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
        <div className="glass rounded-2xl p-4 space-y-3 max-w-xs animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">#{order.order_number}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                </span>
            </div>

            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${config.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-primary"
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
