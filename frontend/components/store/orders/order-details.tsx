import React from "react";
import { ArrowLeft, Package, MapPin, Download } from "lucide-react";
import Image from "next/image";

import OrderOverview from "./order-overview";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order, OrderItem } from "@/schemas";
import { currency } from "@/lib/utils";
import { useStoreSettings } from "@/providers/store-provider";

interface OrderDetailsProps {
    order: Order;
    onBack: () => void;
}

const OrderDetails = ({ order, onBack }: OrderDetailsProps) => {
    const { settings } = useStoreSettings();

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
                    <OrderOverview order={order} />
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
                                                {item.image && (
                                                    <Image fill alt={item.variant?.product?.name || item.image} sizes="80px" src={item.image} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-default-900">{item.name}</h4>
                                                <p className="text-sm text-default-700">Quantity: {item.quantity}</p>
                                                {item.variant && (item.variant.size || item.variant.color || item.variant.measurement) && (
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
                                                        {item.variant.measurement && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-default-600">Measurement:</span>
                                                                <Badge className="text-sm px-2 py-0.5" variant="outline">
                                                                    {item.variant.measurement}
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
                                {order.shipping_method === "PICKUP" ? "Pickup Point" : "Shipping Address"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.shipping_method === "PICKUP" ? (
                                <div className="text-sm space-y-1">
                                    <p className="font-medium text-default-900">{settings?.address}</p>
                                    <p className="text-default-700">Open Mon-Sat: 9am - 6pm</p>
                                </div>
                            ) : (
                                <div className="text-sm space-y-1">
                                    <p className="font-medium text-default-900">
                                        {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                                    </p>
                                    <p className="text-default-700">{order.shipping_address?.address_1}</p>
                                    <p className="text-default-700">
                                        {order.shipping_address?.city}, {order.shipping_address?.state}
                                    </p>
                                    <p className="text-default-700">{order.shipping_address?.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Button className="w-full" variant="outline">
                            Contact Support
                        </Button>
                        {order.invoice_url && (
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
            </div>
        </div>
    );
};

export default OrderDetails;
