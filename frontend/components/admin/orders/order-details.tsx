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
    CircleDashed,
    CircleCheck,
    PackageCheck,
    CircleX,
    CircleSlash,
    Download,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

import OrderProcessingAction from "./order-processing-actions";

import { Order, OrderItem, OrderStatus } from "@/schemas";
import { currency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OrderDetailsProps {
    order: Order;
    onClose: () => void;
}

const getStatusBadge = (status?: OrderStatus) => {
    const variants: Record<OrderStatus, "outline" | "default" | "destructive" | "secondary" | "warning" | "success" | "emerald" | "blue"> = {
        ["PENDING"]: "warning",
        ["PROCESSING"]: "default",
        ["SHIPPED"]: "secondary",
        ["OUT_FOR_DELIVERY"]: "blue",
        ["CANCELED"]: "destructive",
        ["DELIVERED"]: "success",
        ["PAID"]: "emerald",
        ["REFUNDED"]: "destructive",
    };

    return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
};

const paymentStatusMap = {
    PENDING: {
        icon: <ShieldAlert className="h-5 w-5 text-white" />,
        label: "Payment Pending",
        color: "bg-warning",
    },
    SUCCESS: {
        icon: <CircleCheck className="h-5 w-5 text-white" />,
        label: "Paid",
        color: "bg-success",
    },
    FAILED: {
        icon: <CircleDashed className="h-5 w-5 text-white" />,
        label: "Payment Failed",
        color: "bg-danger",
    },
    REFUNDED: {
        icon: <CircleDashed className="h-5 w-5 text-white" />,
        label: "Payment Refunded",
        color: "bg-danger",
    },
};

const orderStatusMap = {
    PENDING: {
        icon: <ShieldAlert className="h-5 w-5 text-white" />,
        label: "Pending",
        color: "bg-warning",
    },
    PROCESSING: {
        icon: <CircleDashed className="h-5 w-5 text-white" />,
        label: "Processing",
        color: "bg-secondary",
    },
    SHIPPED: {
        icon: <Truck className="h-5 w-5 text-white" />,
        label: "Shipped",
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
        icon: <CircleX className="h-5 w-5 text-white" />,
        label: "Cancelled",
        color: "bg-danger",
    },
    PAID: {
        icon: <CircleCheck className="h-5 w-5 text-white" />,
        label: "Paid",
        color: "bg-success",
    },
    REFUNDED: {
        icon: <CircleSlash className="h-5 w-5 text-white" />,
        label: "Refunded",
        color: "bg-danger",
    },
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
    return (
        <div className="px-4 sm:px-6 pb-4 bg-content1 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-content1 py-6">
                <button className="flex items-center text-default-500 hover:text-default-900 cursor-pointer" onClick={onClose}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span>Back to Orders</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">Order: {order.order_number}</h1>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-default-500 mr-2" />
                        <span className="text-default-500">{formatDate(order.created_at)}.</span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">{getStatusBadge(order.status)}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-default-100 px-6 py-4">
                            <h2 className="text-lg font-medium text-default-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-default-100">
                            {order.order_items.map((item: OrderItem, idx: number) => (
                                <div key={idx} className="px-6 py-4">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="shrink-0 mr-4 mb-4 sm:mb-0">
                                            <Image
                                                alt={item.name}
                                                blurDataURL="/placeholder.jpg"
                                                className="object-cover rounded"
                                                height={80}
                                                placeholder="blur"
                                                src={item.image || "/placeholder.jpg"}
                                                width={80}
                                            />
                                        </div>
                                        <div className="grow">
                                            <h3 className="text-sm font-medium text-default-900">{item.name}</h3>
                                            <p className="text-sm text-default-500">SKU: {item.variant_id}</p>
                                            <div className="mt-1 flex flex-col sm:flex-row sm:justify-between">
                                                <div className="flex items-center text-sm text-default-500">
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                                <div className="font-semibold text-default-900">{currency(item.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-divider px-6 py-4">
                            <div className="flex justify-between text-base font-medium text-default-900">
                                <p>Total</p>
                                <p className="font-semibold text-default-900 text-lg">{currency(order.total)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium flex items-center text-default-900">
                                <User className="w-5 h-5 mr-2 text-default-500" />
                                Customer Information
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-default-500">Contact Details</h3>
                                <p className="text-default-900 font-medium">
                                    {order.user.first_name} {order.user.last_name}
                                </p>
                                <p className="text-default-900">{order.user.email}</p>
                                <p className="text-default-900">{order.shipping_address.phone}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-default-500">Shipping Address</h3>
                                <p className="text-default-900">{order.shipping_address.address_1},</p>
                                <p className="text-default-900">
                                    {order.shipping_address.city}, {order.shipping_address.state}.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium flex items-center text-default-900">
                                <CreditCard className="w-5 h-5 mr-2 text-default-500" />
                                Payment Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-default-600">
                                        <span className="font-medium">Method:</span> {order.payment_method}
                                    </p>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium flex items-center text-default-900">
                                <Truck className="w-5 h-5 mr-2 text-default-500" />
                                Shipping Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-default-500">
                                        <span className="font-medium">Method:</span>{" "}
                                        <span className="font-semibold text-default-900">{order.shipping_method}</span>
                                    </p>
                                    <p className="text-default-500">
                                        <span className="font-medium">Tracking:</span>{" "}
                                        <span className="font-semibold text-default-900">{order.order_number}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-background shadow-sm rounded-lg overflow-hidden">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium text-default-900">Actions</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <OrderProcessingAction order={order} />
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

                    <div className="bg-background shadow-sm rounded-lg overflow-hidden pb-6">
                        <div className="border-b border-divider px-6 py-4">
                            <h2 className="text-lg font-medium text-default-900">Order Timeline</h2>
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
                                                        <p className="text-sm text-default-500">Order placed</p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-default-500">
                                                        <time>{format(order.created_at, "MMMM dd")}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="relative pb-6">
                                            <span aria-hidden="true" className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span
                                                        className={
                                                            paymentStatusMap[order.payment_status].color +
                                                            " h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-content1"
                                                        }
                                                    >
                                                        {paymentStatusMap[order.payment_status].icon}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-default-500">{paymentStatusMap[order.payment_status].label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="relative">
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span
                                                        className={
                                                            orderStatusMap[order.status].color +
                                                            " h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-content1"
                                                        }
                                                    >
                                                        {orderStatusMap[order.status].icon}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-default-500">{orderStatusMap[order.status].label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
