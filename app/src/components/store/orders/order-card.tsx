import { Calendar, Eye, Package } from "lucide-react";
import { useMemo } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import OrderDetails from "./order-details";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, OrderItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { currency, formatDate } from "@/lib/utils";
import Overlay from "@/components/overlay";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import ImageDisplay from "@/components/image-display";

const OrderCard = ({ order }: { order: Order }) => {
    const state = useOverlayTriggerState({});
    const numberOfProducts = useMemo(() => {
        return order.order_items.length;
    }, [order]);

    return (
        <Card className="shadow-md bg-card">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-lg font-semibold">{order.order_number}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {numberOfProducts} {numberOfProducts > 1 ? "items" : "item"}
                            </div>
                            <div className="flex items-center gap-1">{currency(order.total)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status} />
                        <Overlay
                            open={state.isOpen}
                            sheetClassName="min-w-[70vw]"
                            trigger={
                                <Button className="flex items-center gap-2" size="sm">
                                    <Eye className="h-4 w-4" />
                                    <span className="hidden sm:inline">See details</span>
                                </Button>
                            }
                            onOpenChange={state.setOpen}
                        >
                            <OrderDetails order={order} onBack={state.close} />
                        </Overlay>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {order.order_items.slice(0, 6).map((item: OrderItem, idx: number) => (
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
            </CardContent>
        </Card>
    );
};

export default OrderCard;
