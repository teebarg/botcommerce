"use client";

import React from "react";
import {
    User,
    CreditCard,
    Truck,
    Calendar,
    Clock,
    ArrowLeft,
    ShieldAlert,
    PackageCheck,
    Download,
    RefreshCw,
    Package,
    XCircle,
    RotateCcw,
} from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import OrderProcessingAction from "./order-processing-actions";
import { OrderStatusBadge } from "./order-status-badge";

import { useOrderTimeline } from "@/lib/hooks/useOrder";
import { Order, OrderItem } from "@/schemas";
import { useReturnOrderItem } from "@/lib/hooks/useOrder";
import { currency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";

interface OrderDetailsProps {
    order: Order;
    onClose: () => void;
}

const orderStatusMap = {
    PENDING: {
        icon: <ShieldAlert className="h-5 w-5 text-white" />,
        label: "Pending",
        color: "bg-warning",
    },
    PROCESSING: {
        icon: <RefreshCw className="h-5 w-5 text-white" />,
        label: "Processing",
        color: "bg-accent",
    },
    SHIPPED: {
        icon: <Package className="h-5 w-5 text-white" />,
        label: "Order Packed",
        color: "bg-primary",
    },
    OUT_FOR_DELIVERY: {
        icon: <Truck className="h-5 w-5 text-white" />,
        label: "Out for Delivery",
        color: "bg-primary",
    },
    DELIVERED: {
        icon: <PackageCheck className="h-5 w-5 text-white" />,
        label: "Delivered",
        color: "bg-success",
    },
    CANCELED: {
        icon: <XCircle className="h-5 w-5 text-white" />,
        label: "Cancelled",
        color: "bg-destructive",
    },
    REFUNDED: {
        icon: <RotateCcw className="h-5 w-5 text-white" />,
        label: "Refunded",
        color: "bg-destructive",
    },
};

const OrderItemCard: React.FC<{ orderItem: OrderItem; orderId: number }> = ({ orderItem, orderId }) => {
    const deleteState = useOverlayTriggerState({});
    const { mutateAsync: returnItem } = useReturnOrderItem();

    const handleRemove = () => {
        returnItem({ orderId, itemId: orderItem.id }).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="flex gap-4 px-2 py-4">
            <div className="h-28 w-28 rounded-lg overflow-hidden">
                <img alt={orderItem.name} className="object-cover w-full h-full" src={orderItem.image || "/placeholder.jpg"} />
            </div>
            <div className="grow">
                <h3 className="text-sm font-medium">{orderItem.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {orderItem.variant_id}</p>
                <div className="mt-1 flex flex-col gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span>Qty: {orderItem.quantity}</span>
                    </div>
                    <div className="font-semibold">{currency(orderItem.price)}</div>
                </div>
            </div>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <div className="font-semibold bg-destructive text-white px-4 py-2 rounded-md cursor-pointer">Return item</div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete {orderItem.name}</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={handleRemove} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
    const { data: timeline } = useOrderTimeline(order?.id);

    return (
        <div className="px-4 sm:px-6 pb-4 bg-content1 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-content1 py-6">
                <button className="flex items-center text-muted-foreground cursor-pointer" onClick={onClose}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span>Back to Orders</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order: {order.order_number}</h1>
                    <div className="flex items-center">
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
                        <div className="border-b border-default-100 px-6 py-4">
                            <h2 className="text-lg font-medium">Order Items</h2>
                        </div>
                        <div className="divide-y divide-default-100">
                            {order.order_items.map((item: OrderItem, idx: number) => (
                                <OrderItemCard key={idx} orderId={order.id} orderItem={item} />
                            ))}
                        </div>
                        <div className="border-t border-divider px-6 py-4">
                            <div className="flex justify-between text-sm font-medium">
                                <p>Subtotal</p>
                                <p className="font-semibold">{currency(order.subtotal)}</p>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <p>Shipping</p>
                                <p className="font-semibold">{currency(order.shipping_fee)}</p>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <p>Tax</p>
                                <p className="font-semibold">{currency(order.tax)}</p>
                            </div>
                            <div className="flex justify-between text-sm font-medium mt-4">
                                <p>Total</p>
                                <p className="font-semibold text-lg">{currency(order.total)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium flex items-center">
                                <User className="w-5 h-5 mr-2 text-muted-foreground" />
                                Customer Information
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Contact Details</h3>
                                <p className="font-medium">
                                    {order.user?.first_name} {order.user?.last_name}
                                </p>
                                <p>{order.user?.email}</p>
                                <p>{order.shipping_address?.phone}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Shipping Address</h3>
                                {!order.shipping_address ? (
                                    <p>Not applicable ({order.shipping_method})</p>
                                ) : (
                                    <>
                                        <p>{order.shipping_address?.address_1},</p>
                                        <p>
                                            {order.shipping_address?.city}, {order.shipping_address?.state}.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-muted-foreground" />
                                Payment Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium">Method:</span> {order.payment_method}
                                    </p>
                                </div>
                                <OrderStatusBadge status={order.status} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium flex items-center">
                                <Truck className="w-5 h-5 mr-2 text-muted-foreground" />
                                Shipping Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium">Method:</span> <span className="font-semibold">{order.shipping_method}</span>
                                    </p>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium">Tracking:</span> <span className="font-semibold">{order.order_number}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium">Actions</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <OrderProcessingAction order={order} />
                            {order.payment_status === "SUCCESS" && order.invoice_url && (
                                <a
                                    download
                                    className="flex items-center justify-center text-sm font-medium transition-colors bg-transparent border border-primary text-primary py-2 px-4 rounded-lg w-full"
                                    href={order.invoice_url}
                                >
                                    <Download className="w-4 h-4 mr-2 group-hover/link:translate-y-[-1px] transition-transform" />
                                    Download Invoice
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden pb-6">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium">Order Timeline</h2>
                        </div>
                        <div className="p-6">
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    <li>
                                        <div className="relative pb-6">
                                            <span aria-hidden="true" className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center ring-8 ring-content1">
                                                        <Clock className="h-5 w-5 text-white" />
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Order placed</p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                                                        <time>{formatDate(order.created_at)}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    {(timeline || []).map((evt, idx) => (
                                        <li key={idx}>
                                            <div className="relative pb-6">
                                                <span
                                                    aria-hidden="true"
                                                    className={
                                                        idx === (timeline?.length || 0) - 1
                                                            ? "hidden"
                                                            : "absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                    }
                                                />
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span
                                                            className={
                                                                orderStatusMap[evt.to_status as keyof typeof orderStatusMap].color +
                                                                " h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-content1"
                                                            }
                                                        >
                                                            {orderStatusMap[evt.to_status as keyof typeof orderStatusMap].icon}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div className="flex-1">
                                                            <p className="text-sm text-muted-foreground">
                                                                {orderStatusMap[evt.to_status as keyof typeof orderStatusMap].label}
                                                            </p>
                                                            {evt.message && <p className="text-sm text-muted-foreground">{evt.message}</p>}
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                                                            <time>{formatDate(evt.created_at)}</time>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {timeline?.length === 0 && <p className="text-sm text-muted-foreground">No timeline events found</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
