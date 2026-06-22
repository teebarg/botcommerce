import { useMemo } from "react";
import { useOverlayTriggerState } from "react-stately";
import OrderDetails from "./order-details";
import type { Order, OrderItem } from "@/schemas";
import { currency, formatDate } from "@/utils";
import Overlay from "@/components/overlay";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import ImageDisplay from "@/components/image-display";

const OrderCard = ({ order }: { order: Order }) => {
    const state = useOverlayTriggerState({});
    const numberOfProducts = useMemo(() => {
        return order.order_items.length;
    }, [order]);

    return (
        <Overlay
            open={state.isOpen}
            trigger={
                <div className="block rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="flex gap-2 mb-3">
                        {order.order_items.slice(0, 4).map((item: OrderItem, idx: number) => (
                            <div key={idx} className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-secondary ring-1 ring-border">
                                {item.image && <ImageDisplay alt={item?.name || item.image} url={item.image} />}
                            </div>
                        ))}
                        {order.order_items.length > 4 && (
                            <div className="w-14 h-14 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
                                <span className="text-xs font-medium text-muted-foreground">+{order.order_items.length - 4}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
                        <span className="text-muted-foreground">
                            {numberOfProducts} {numberOfProducts > 1 ? "items" : "item"}
                        </span>
                        <span className="font-medium">{currency(order.total)}</span>
                    </div>
                </div>
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
