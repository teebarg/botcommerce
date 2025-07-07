import { Calendar, Eye, Package } from "lucide-react";
import { useMemo } from "react";
import Image from "next/image";
import { useOverlayTriggerState } from "@react-stately/overlays";

import OrderDetails from "./order-details";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, OrderItem } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currency, formatDate } from "@/lib/utils";
import Overlay from "@/components/overlay";

const statusConfig: Record<Order["status"], { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    SHIPPED: { label: "Shipped", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    OUT_FOR_DELIVERY: { label: "Out for delivery", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    CANCELED: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    REFUNDED: { label: "Refunded", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const OrderCard = ({ order }: { order: Order }) => {
    const state = useOverlayTriggerState({});
    const numberOfProducts = useMemo(() => {
        return order.order_items.length;
    }, [order]);

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-background">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-lg font-semibold text-default-900">{order.order_number}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-default-700">
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
                        <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
                        <Overlay
                            open={state.isOpen}
                            sheetClassName="min-w-[70vw]"
                            trigger={
                                <Button className="flex items-center gap-2" size="sm" variant="outline">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {order.order_items.slice(0, 6).map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex flex-col items-center group">
                            <div className="h-20 w-20 relative group-hover:scale-105 transition-transform duration-200 rounded-lg">
                                {item.image && <Image fill alt={item.variant?.product?.name || item.image} src={item.image} />}
                            </div>
                            <span className="text-xs font-medium text-center text-default-500">x{item.quantity}</span>
                        </div>
                    ))}
                    {order.order_items.length > 6 && (
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-content2 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-sm font-medium text-default-500">+{order.order_items.length - 6}</span>
                            </div>
                            <span className="text-xs text-default-400">more</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderCard;
