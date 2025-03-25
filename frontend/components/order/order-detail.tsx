"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderItem, OrderStatus } from "@/lib/models";
import { api } from "@/apis";
import { currency } from "@/lib/util/util";

const OrderDetail = () => {
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const { data, error } = await api.order.get(params.id as string);

            if (error) {
                throw error;
            }
            setOrder(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const handleStatusChange = async (newStatus: OrderStatus) => {
        try {
            // switch (newStatus) {
            //     case OrderStatus.CANCELLED:
            //         await orderApi.cancel(order.id.toString());
            //         break;
            //     case OrderStatus.FULFILLED:
            //         await orderApi.fulfill(order.id.toString());
            //         break;
            //     case OrderStatus.REFUNDED:
            //         await orderApi.refund(order.id.toString());
            //         break;
            // }
            toast.success("Order status updated successfully");
            fetchOrder();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getStatusBadge = (status?: OrderStatus) => {
        const variants: Record<OrderStatus, "outline" | "default" | "destructive" | "secondary"> = {
            ["PENDING"]: "outline",
            ["PROCESSING"]: "default",
            ["SHIPPED"]: "secondary",
            ["CANCELED"]: "destructive",
            ["DELIVERED"]: "default",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!order) {
        return <div>Order not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                    <p className="text-muted-foreground">Placed on {format(new Date(order.created_at), "MMMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-2">
                    {order.status === "PENDING" && (
                        <Button variant="destructive" onClick={() => handleStatusChange("CANCELED")}>
                            Cancel Order
                        </Button>
                    )}
                    {order.status === "PROCESSING" && <Button onClick={() => handleStatusChange("SHIPPED")}>Mark as Fulfilled</Button>}
                    {order.status === "SHIPPED" && (
                        <Button variant="secondary" onClick={() => handleStatusChange("PENDING")}>
                            Refund Order
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Name:</span> {order.user?.first_name} {order.user?.last_name}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span> {order.user?.email}
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium">Status:</span> {getStatusBadge(order.status)}
                        </div>
                        <p>
                            <span className="font-medium">Order Number:</span> {order.order_number}
                        </p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                    <div className="space-y-1">
                        <p>
                            {order.shipping_address.first_name} {order.shipping_address.last_name}
                        </p>
                        <p>{order.shipping_address.address_1}</p>
                        {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                        <p>
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </p>
                        {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
                    <div className="space-y-1">
                        <p>
                            {order.billing_address.first_name} {order.billing_address.last_name}
                        </p>
                        <p>{order.billing_address.address_1}</p>
                        {order.billing_address.address_2 && <p>{order.billing_address.address_2}</p>}
                        <p>
                            {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                        </p>
                        {order.billing_address.phone && <p>Phone: {order.billing_address.phone}</p>}
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                    {order.order_items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-12 w-12 relative rounded-md">
                                    <Image fill alt={item.variant.name} src={item.image ?? ""} />
                                </div>
                                <div>
                                    <p className="font-medium">{item.variant.name}</p>
                                    <p className="text-sm text-muted-foreground">SKU: {item.variant.sku}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p>
                                    {currency(item.price)} x {item.quantity}
                                </p>
                                <p className="font-medium">{currency(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p>Subtotal</p>
                            <p>{currency(order.subtotal)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Shipping</p>
                            <p>{currency(order.shipping_fee)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Tax</p>
                            <p>{currency(order.tax)}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <p>Total</p>
                            <p>{currency(order.total)}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* {order.notes && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Order Notes</h2>
                    <p className="whitespace-pre-wrap">{order.notes}</p>
                </Card>
            )} */}
        </div>
    );
};

export default OrderDetail;
