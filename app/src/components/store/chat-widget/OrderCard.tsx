import { Package, Truck, CheckCircle2, RotateCcw, ExternalLink } from "lucide-react";
import { OrderInfo } from "./types";
import { motion } from "framer-motion";

const statusConfig = {
    processing: { icon: Package, label: "Processing", color: "text-yellow-400", bg: "bg-yellow-400/10", progress: 25 },
    shipped: { icon: Truck, label: "Shipped", color: "text-blue-400", bg: "bg-blue-400/10", progress: 60 },
    delivered: { icon: CheckCircle2, label: "Delivered", color: "text-green-400", bg: "bg-green-400/10", progress: 100 },
    returned: { icon: RotateCcw, label: "Returned", color: "text-red-400", bg: "bg-red-400/10", progress: 100 },
};

export const OrderCard = ({ order }: { order: OrderInfo }) => {
    const config = statusConfig[order.status];
    const Icon = config.icon;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-4 space-y-3 max-w-xs">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">#{order.orderId}</span>
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
                    className="h-full rounded-full gradient-primary"
                />
            </div>

            <div className="space-y-1">
                {order.items.map((item, i) => (
                    <p key={i} className="text-sm text-foreground">
                        {item}
                    </p>
                ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</span>
                {order.estimatedDelivery && <span className="text-xs text-muted-foreground">Est. {order.estimatedDelivery}</span>}
            </div>

            {order.trackingUrl && (
                <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                    <ExternalLink className="w-3 h-3" />
                    Track Package
                </a>
            )}
        </motion.div>
    );
};
