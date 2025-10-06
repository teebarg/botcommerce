"use client";

import { CheckCircle, Package, Calendar, Clock, RefreshCw, X, Truck } from "lucide-react";

import { Order, OrderStatus } from "@/schemas";
import { cn, formatDate } from "@/lib/utils";

const OrderOverview = ({ order }: { order: Order }) => {
    const isPending = order.payment_status === "PENDING";
    const getOrderStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case "PENDING":
                return <Clock className="h-4 w-4 text-orange-600" />;
            case "PROCESSING":
                return <RefreshCw className="h-4 w-4 text-blue-600" />;
            case "SHIPPED":
                return <Package className="h-4 w-4 text-purple-600" />;
            case "OUT_FOR_DELIVERY":
                return <Truck className="h-4 w-4 text-indigo-600" />;
            case "DELIVERED":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "CANCELED":
                return <X className="h-4 w-4 text-red-600" />;
            case "REFUNDED":
                return <RefreshCw className="h-4 w-4 text-gray-600" />;
            default:
                return <Clock className="h-4 w-4 text-orange-600" />;
        }
    };

    const getOrderStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "PENDING":
                return "text-orange-600";
            case "PROCESSING":
                return "text-blue-600";
            case "SHIPPED":
                return "text-purple-600";
            case "OUT_FOR_DELIVERY":
                return "text-indigo-600";
            case "DELIVERED":
                return "text-green-600";
            case "CANCELED":
                return "text-red-600";
            case "REFUNDED":
                return "text-gray-600";
            default:
                return "text-orange-600";
        }
    };

    const formatOrderStatus = (status: OrderStatus) => {
        return status
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    return (
        <div className={cn("bg-card rounded-lg p-6 space-y-4 mb-4")}>
            <h3 className="text-xl font-semibold">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">Order Number:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{order.order_number}</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">Order Date:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{formatDate(order.created_at)}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    {getOrderStatusIcon(order.status)}
                    <span className="font-medium">Order Status:</span>
                    <span className={`text-sm font-medium ${getOrderStatusColor(order.status)}`}>{formatOrderStatus(order.status)}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    {isPending ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                    <span className="font-medium">Payment Status:</span>
                    <span className={`text-sm font-medium ${isPending ? "text-orange-600" : "text-green-600"}`}>
                        {isPending ? "Pending Transfer" : "Completed"}
                    </span>
                </div>
                {isPending && (
                    <p className="text-sm text-muted-foreground mt-2 ml-6">
                        Your order will be processed once we receive your bank transfer payment.
                    </p>
                )}
            </div>
        </div>
    );
};

export default OrderOverview;
