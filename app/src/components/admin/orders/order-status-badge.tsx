import { CheckCircle, Package, PackageCheck, RefreshCw, RotateCcw, ShieldAlert, Truck, XCircle } from "lucide-react";
import { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/schemas";

export const PaymentStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<
        string,
        { icon: JSX.Element; label: string; variant: "destructive" | "default" | "secondary" | "emerald" | "warning" }
    > = {
        ["PENDING"]: {
            icon: <ShieldAlert className="mr-1" size={14} />,
            label: "Payment Pending",
            variant: "warning",
        },
        ["FAILED"]: {
            icon: <XCircle className="mr-1" size={14} />,
            label: "Payment Failed",
            variant: "destructive",
        },
        ["SUCCESS"]: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Payment Successful",
            variant: "emerald",
        },
        ["REFUNDED"]: {
            icon: <RotateCcw className="mr-1" size={14} />,
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
            icon: <ShieldAlert className="mr-1" size={14} />,
            label: "Pending",
            variant: "yellow",
        },
        ["PROCESSING"]: {
            icon: <RefreshCw className="mr-1" size={14} />,
            label: "Processing",
            variant: "default",
        },
        ["SHIPPED"]: {
            icon: <Package className="mr-1" size={14} />,
            label: "Order Packed",
            variant: "secondary",
        },
        ["OUT_FOR_DELIVERY"]: {
            icon: <Truck className="mr-1" size={14} />,
            label: "Out for delivery",
            variant: "blue",
        },
        ["DELIVERED"]: {
            icon: <PackageCheck className="mr-1" size={14} />,
            label: "Delivered",
            variant: "emerald",
        },
        ["CANCELED"]: {
            icon: <XCircle className="mr-1" size={14} />,
            label: "Delivered",
            variant: "destructive",
        },
        ["REFUNDED"]: {
            icon: <RotateCcw className="mr-1" size={14} />,
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
