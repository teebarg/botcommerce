import React from "react";
import { ArrowLeft, Package, Calendar, MapPin, Truck } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order, OrderItem } from "@/schemas";
import { currency, formatDate } from "@/lib/utils";

interface OrderDetailsProps {
    order: Order;
    onBack: () => void;
}

const statusConfig: Record<Order["status"], { label: string; color: string; description: string }> = {
    PENDING: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        description: "Your order is being prepared",
    },
    PROCESSING: {
        label: "Shipped",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        description: "Your order is on its way",
    },
    SHIPPED: {
        label: "Delivered",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        description: "Your order has been delivered",
    },
    OUT_FOR_DELIVERY: {
        label: "Out for delivery",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        description: "Your order is out for delivery",
    },
    DELIVERED: {
        label: "Delivered",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        description: "Your order has been delivered",
    },
    CANCELED: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        description: "This order was cancelled",
    },
    PAID: {
        label: "Paid",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        description: "This order was paid",
    },
    REFUNDED: {
        label: "Refunded",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        description: "This order was refunded",
    },
};

const OrderDetails = ({ order, onBack }: OrderDetailsProps) => {
    return (
        <div className="space-y-6 px-4 md:px-8 py-8 overflow-auto">
            <div className="flex items-center gap-4">
                <Button className="flex items-center gap-2" size="sm" variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Orders
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-default-900">Order Details</h2>
                    <p className="text-default-600">{order.order_number}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Order Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
                                    <p className="text-sm text-default-600 mt-2">{statusConfig[order.status].description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-default-600">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(order.created_at)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Items ({order.order_items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.order_items.map((item: OrderItem, idx: number) => (
                                    <div key={idx}>
                                        <div className="flex items-center gap-4">
                                            <div className="h-20 w-20 relative group-hover:scale-105 transition-transform duration-200 rounded-lg overflow-hidden">
                                                {item.image && <Image fill alt={item.variant?.product?.name || item.image} src={item.image} />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-default-900">{item.name}</h4>
                                                <p className="text-sm text-default-700">Quantity: {item.quantity}</p>
                                                {item.variant && (item.variant.size || item.variant.color) && (
                                                    <div className="flex flex-wrap gap-1.5 mb-2 mt-4">
                                                        {item.variant.color && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-default-600">Color:</span>
                                                                <Badge className="text-sm px-2 py-0.5" variant="outline">
                                                                    {item.variant.color}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {item.variant.size && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-default-600">Size:</span>
                                                                <Badge className="text-sm px-2 py-0.5" variant="outline">
                                                                    {item.variant.size}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-default-900">{currency(item.price)}</p>
                                            </div>
                                        </div>
                                        {idx < order.order_items.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-default-700">Subtotal</span>
                                <span className="text-default-900">{currency(order.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-default-700">Shipping</span>
                                <span className="text-default-900">{currency(order.shipping_fee)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                                <span className="text-default-800">Total</span>
                                <span className="text-default-900">{currency(order.total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1">
                                <p className="font-medium text-default-900">
                                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                                </p>
                                <p className="text-default-700">{order.shipping_address.address_1}</p>
                                <p className="text-default-700">
                                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                                </p>
                                <p className="text-default-700">{order.shipping_address.phone}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="space-y-3">
                        <Button className="w-full" variant="outline">
                            Contact Support
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => window.open(`/api/orders/${order.id}/invoice`, "_blank")}>
                            Download Invoice (PDF)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
