import { Calendar, Package } from "lucide-react";
import { useMemo } from "react";
import { useOverlayTriggerState } from "react-stately";
import OrderDetails from "./order-details";
import type { Order, OrderItem } from "@/schemas";
import { currency, formatDate } from "@/utils";
import Overlay from "@/components/overlay";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import ImageDisplay from "@/components/image-display";
import { motion } from "framer-motion";

const OrderCard = ({ order, idx }: { order: Order; idx: number }) => {
    const state = useOverlayTriggerState({});
    const numberOfProducts = useMemo(() => {
        return order.order_items.length;
    }, [order]);

    return (
        <Overlay
            open={state.isOpen}
            trigger={
                <motion.div
                    key={order.id + idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-2"
                >
                    <div className="flex gap-2">
                        <p className="font-semibold">{order.order_number}</p>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {numberOfProducts} {numberOfProducts > 1 ? "items" : "item"}
                        </div>
                        <div>{currency(order.total)}</div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {order.order_items.slice(0, 2).map((item: OrderItem, idx: number) => (
                            <div
                                key={idx}
                                className="aspect-product h-40 w-40 relative group-hover:scale-105 transition-transform duration-200 rounded-lg overflow-hidden"
                            >
                                {item.image && <ImageDisplay alt={item.variant?.product?.name || item.image} url={item.image} />}
                            </div>
                        ))}
                        {order.order_items.length > 6 && (
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">+{order.order_items.length - 6}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">more</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            }
            onOpenChange={state.setOpen}
            showHeader={true}
            sheetClassName="md:max-w-6xl"
            title={<div className="text-base">Order Details ({order.order_number})</div>}
        >
            <OrderDetails order={order} />
        </Overlay>
    );
};

export default OrderCard;
