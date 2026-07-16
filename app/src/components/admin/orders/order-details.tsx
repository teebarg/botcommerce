import type React from "react";
import { Truck, Calendar, ShieldAlert, PackageCheck, Download, RefreshCw, Package, XCircle, RotateCcw } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import OrderProcessingAction from "./order-processing-actions";
import { OrderStatusBadge } from "./order-status-badge";
import { useOrderTimeline } from "@/hooks/useOrder";
import { OrderStatus, type Order, type OrderItem } from "@/schemas";
import { useReturnOrderItem } from "@/hooks/useOrder";
import { currency, formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { Button } from "@/components/ui/button";
import { ReactElement } from "react";
import OrderSummary from "@/components/store/orders/order-summary";
import ImageLightbox from "@/components/image-lightbox";
import { cn } from "@/utils/cn";

interface OrderDetailsProps {
    order: Order;
    onClose: () => void;
}

const timelineDotColor: Record<string, string> = {
    DELIVERED: "bg-success",
    CANCELED: "bg-destructive",
    REFUNDED: "bg-destructive",
};

function getDotColor(status: string) {
    return timelineDotColor[status] ?? "bg-foreground";
}

const orderStatusMap: Record<OrderStatus, { icon: ReactElement; label: string; color: string }> = {
    [OrderStatus.PENDING]: {
        icon: <ShieldAlert className="h-5 w-5 text-white" />,
        label: "Pending",
        color: "bg-warning",
    },
    [OrderStatus.PROCESSING]: {
        icon: <RefreshCw className="h-5 w-5 text-white" />,
        label: "Processing",
        color: "bg-accent",
    },
    [OrderStatus.SHIPPED]: {
        icon: <Package className="h-5 w-5 text-secondary-foreground" />,
        label: "Order Packed",
        color: "bg-secondary",
    },
    [OrderStatus.OUT_FOR_DELIVERY]: {
        icon: <Truck className="h-5 w-5 text-primary-foreground" />,
        label: "Out for Delivery",
        color: "bg-primary",
    },
    [OrderStatus.DELIVERED]: {
        icon: <PackageCheck className="h-5 w-5 text-white" />,
        label: "Delivered",
        color: "bg-emerald-700",
    },
    [OrderStatus.CANCELED]: {
        icon: <XCircle className="h-5 w-5 text-destructive-foreground" />,
        label: "Cancelled",
        color: "bg-destructive",
    },
    [OrderStatus.REFUNDED]: {
        icon: <RotateCcw className="h-5 w-5 text-destructive-foreground" />,
        label: "Refunded",
        color: "bg-destructive",
    },
};

const OrderItemCard: React.FC<{ item: OrderItem; orderId: number, isPaid: boolean }> = ({ item, orderId, isPaid = false }) => {
    const deleteState = useOverlayTriggerState({});
    const { mutateAsync: returnItem, isPending } = useReturnOrderItem();

    const handleRemove = () => {
        returnItem({ orderId, itemId: item.id }).then(() => {
            deleteState.close();
        });
    };

    const variantText = [
        item.variant?.size && `S: ${item.variant.size}`,
        item.variant?.color && `Color: ${item.variant.color}`,
        item.variant?.width && `W: ${item.variant.width}`,
        item.variant?.length && `L: ${item.variant.length}`,
        item.variant?.age && `Age: ${item.variant.age}`,
    ].filter(Boolean).join(" · ");

    const outOfStock = item.variant?.inventory < 1

    return (
        <div className="flex items-start gap-4 px-4 py-2.5">
            <div className={cn("relative w-16 h-16 shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border", !isPaid && outOfStock && "opacity-50")}>
                <ImageLightbox
                    url={item?.image}
                    alt={item?.name}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className={cn("flex items-center justify-between gap-2", outOfStock && "line-through text-muted-foreground")}>
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {outOfStock && (
                        <Badge variant="destructive" className="shrink-0">
                            <span>Out of stock</span>
                        </Badge>
                    )}
                </div>
                {variantText && <p className="text-xs text-muted-foreground mt-0.5">{variantText}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                    {item.quantity} × {currency(Number(item.price) || 0)}
                </p>
                {!isPaid && (
                    <ConfirmDrawer
                        open={deleteState.isOpen}
                        onOpenChange={deleteState.setOpen}
                        trigger={<Button variant="destructive" size="xs" className="mt-2">Return</Button>}
                        onClose={deleteState.close}
                        onConfirm={handleRemove}
                        title={`Return ${item.name}`}
                        confirmText="Return"
                        isLoading={isPending}
                    />
                )}
            </div>
        </div>
    );
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
    const { data: timeline } = useOrderTimeline(order?.id);

    return (
        <div className="px-2 sm:px-6 py-4 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Order: {order.order_number}</h1>
                    <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">{formatDate(order.created_at)}.</span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className={cn("rounded-xl border bg-card p-4 mb-4 hidden", order.order_notes && "block")}>
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Notes</p>
                            <p className="text-sm text-foreground">{order.order_notes}</p>
                        </div>
                        <div className="rounded-xl border bg-card overflow-hidden mb-4">
                            <div className="w-full flex justify-between items-center px-4 py-3">
                                <span className="text-sm font-medium">Order items ({order.order_items.length})</span>
                            </div>
                            <div className="divide-y divide-border border-t">
                                {order.order_items.map((item, idx) => (
                                    <OrderItemCard key={idx} orderId={order.id} item={item} isPaid={order.payment_status === "SUCCESS"} />
                                ))}
                            </div>
                        </div>
                        <OrderSummary order={order} />
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Customer information</p>
                        </div>
                        <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Contact details</p>
                                <p className="text-sm font-medium">
                                    {order.user?.first_name} {order.user?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                                <p className="text-sm text-muted-foreground">{order.shipping_address?.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Shipping address</p>
                                {!order.shipping_address ? (
                                    <p className="text-sm text-muted-foreground">Not applicable ({order.shipping_method})</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium">
                                            {order.shipping_address?.address_1}, {order.shipping_address?.address_2}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{order.shipping_address?.state}</p>
                                    </>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Contact number</p>
                                <p className="text-sm font-medium">{order?.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Payment information</p>
                        </div>
                        <div className="px-4 py-4 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Method</p>
                                <p className="text-sm font-medium">{order.payment_method}</p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Shipping information</p>
                        </div>
                        <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Method</p>
                                <p className="text-sm font-medium">{order.shipping_method}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Tracking</p>
                                <p className="text-sm font-medium">{order.order_number}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Actions</p>
                        </div>
                        <div className="px-4 py-4 space-y-3">
                            <OrderProcessingAction order={order} />
                            {order.payment_status === "SUCCESS" && order.invoice_url && (
                                <a
                                    download
                                    href={order.invoice_url}
                                    className="flex items-center justify-center gap-2 text-sm font-medium border border-border text-foreground py-2.5 px-4 rounded-full w-full hover:bg-muted transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download invoice
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Order timeline</p>
                        </div>
                        <div className="px-4 py-4">
                            {timeline?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No timeline events found</p>
                            ) : (
                                <ul>
                                    <li className="relative pb-5 last:pb-0">
                                        <span aria-hidden="true" className="absolute top-3 left-[5px] -ml-px h-full w-px bg-border" />
                                        <div className="relative flex items-start gap-3">
                                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-foreground shrink-0" />
                                            <div className="flex-1 min-w-0 flex justify-between gap-3">
                                                <p className="text-sm font-medium">Order placed</p>
                                                <time className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.created_at)}</time>
                                            </div>
                                        </div>
                                    </li>

                                    {(timeline || []).map((evt, idx) => {
                                        const isLast = idx === (timeline?.length || 0) - 1;
                                        const status = evt.to_status as keyof typeof orderStatusMap;

                                        return (
                                            <li key={idx} className="relative pb-5 last:pb-0">
                                                {!isLast && (
                                                    <span aria-hidden="true" className="absolute top-3 left-[5px] -ml-px h-full w-px bg-border" />
                                                )}
                                                <div className="relative flex items-start gap-3">
                                                    <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${getDotColor(evt.to_status!)}`} />
                                                    <div className="flex-1 min-w-0 flex justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-medium">{orderStatusMap[status].label}</p>
                                                            {evt.message && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">{evt.message}</p>
                                                            )}
                                                        </div>
                                                        <time className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(evt.created_at)}</time>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default OrderDetails;
