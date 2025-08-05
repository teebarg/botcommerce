"use client";

import { AlertTriangle, CheckCircle, Clock, ShoppingCart } from "lucide-react";
import { Exclamation } from "nui-react-icons";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/schemas";

export const PaymentStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<
        string,
        { icon: JSX.Element; label: string; variant: "destructive" | "default" | "secondary" | "emerald" | "warning" }
    > = {
        ["PENDING"]: {
            icon: <AlertTriangle className="mr-1" size={14} />,
            label: "Payment Pending",
            variant: "warning",
        },
        ["FAILED"]: {
            icon: <Exclamation className="mr-1" size={14} />,
            label: "Payment Failed",
            variant: "destructive",
        },
        ["SUCCESS"]: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Payment Successful",
            variant: "emerald",
        },
        ["REFUNDED"]: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Payment Refunded",
            variant: "default",
        },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <Badge variant={config.variant}>
            {config.icon}
            {config.label}
        </Badge>
    );
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
    const statusConfig: Record<
        OrderStatus,
        { icon: JSX.Element; label: string; variant: "destructive" | "default" | "secondary" | "emerald" | "yellow" | "blue" }
    > = {
        ["PENDING"]: {
            icon: <AlertTriangle className="mr-1" size={14} />,
            label: "Pending",
            variant: "yellow",
        },
        ["PROCESSING"]: {
            icon: <Clock className="mr-1" size={14} />,
            label: "Processing",
            variant: "default",
        },
        ["SHIPPED"]: {
            icon: <ShoppingCart className="mr-1" size={14} />,
            label: "Shipped",
            variant: "secondary",
        },
        ["OUT_FOR_DELIVERY"]: {
            icon: <ShoppingCart className="mr-1" size={14} />,
            label: "Out for delivery",
            variant: "blue",
        },
        ["DELIVERED"]: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Delivered",
            variant: "emerald",
        },
        ["CANCELED"]: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Delivered",
            variant: "destructive",
        },
        ["REFUNDED"]: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Delivered",
            variant: "emerald",
        },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <Badge variant={config.variant}>
            {config.icon}
            {config.label}
        </Badge>
    );
};
