import { CheckCircle, Package, PackageCheck, RefreshCw, RotateCcw, ShieldAlert, Truck, XCircle } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { BadgeVariant, OrderStatus } from "@/schemas";

export const PaymentStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<
        string,
        { icon: JSX.Element; label: string; variant: BadgeVariant }
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
            variant: "success",
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
        { icon: JSX.Element; label: string; variant: BadgeVariant }
    > = {
        [OrderStatus.PENDING]: {
            icon: <ShieldAlert className="mr-1" size={14} />,
            label: "Pending",
            variant: "warning-subtle",
        },
        [OrderStatus.PROCESSING]: {
            icon: <RefreshCw className="mr-1" size={14} />,
            label: "Processing",
            variant: "default",
        },
        [OrderStatus.SHIPPED]: {
            icon: <Package className="mr-1" size={14} />,
            label: "Order Packed",
            variant: "accent-subtle",
        },
        [OrderStatus.OUT_FOR_DELIVERY]: {
            icon: <Truck className="mr-1" size={14} />,
            label: "Out for delivery",
            variant: "accent",
        },
        [OrderStatus.DELIVERED]: {
            icon: <PackageCheck className="mr-1" size={14} />,
            label: "Delivered",
            variant: "success",
        },
        [OrderStatus.CANCELED]: {
            icon: <XCircle className="mr-1" size={14} />,
            label: "Canceled",
            variant: "destructive",
        },
        [OrderStatus.REFUNDED]: {
            icon: <RotateCcw className="mr-1" size={14} />,
            label: "Refunded",
            variant: "success-subtle",
        },
    };
    
    const config = statusConfig[status] || statusConfig[OrderStatus.PENDING];

    return (
        <Badge variant={config.variant}>
            {config.icon}
            {config.label}
        </Badge>
    );
};
