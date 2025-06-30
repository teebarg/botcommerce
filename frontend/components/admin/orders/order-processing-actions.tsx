"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/schemas";
import { useChangeOrderStatus } from "@/lib/hooks/useOrder";

interface OrderProcessingActionProps {
    order: Order;
}

const OrderProcessingAction: React.FC<OrderProcessingActionProps> = ({ order }) => {
    const statusConfig: Record<
        "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED" | "PAID" | "REFUNDED",
        {
            color: string;
            label: string;
            nextStatus: OrderStatus | null;
            actionLabel: string;
            variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
        }
    > = {
        PAID: {
            color: "bg-success/20 text-success",
            label: "Paid",
            nextStatus: "PROCESSING" as const,
            actionLabel: "Process Order",
            variant: "default",
        },
        REFUNDED: {
            color: "bg-danger/20 text-danger",
            label: "Refunded",
            nextStatus: null,
            actionLabel: "",
            variant: "destructive",
        },
        PENDING: {
            color: "bg-warning/20 text-warning",
            label: "Pending",
            nextStatus: "PAID" as const,
            actionLabel: "Mark as Paid",
            variant: "warning",
        },
        PROCESSING: {
            color: "bg-primary/20 text-primary",
            label: "Processing",
            nextStatus: "SHIPPED" as const,
            actionLabel: "Mark Shipped",
            variant: "secondary",
        },
        SHIPPED: {
            color: "bg-blue-100 text-blue-700",
            label: "Shipped",
            nextStatus: "DELIVERED" as const,
            actionLabel: "Mark Delivered",
            variant: "default",
        },
        DELIVERED: {
            color: "bg-success/20 text-success",
            label: "Delivered",
            nextStatus: null,
            actionLabel: "",
            variant: "success",
        },
        CANCELED: {
            color: "bg-danger/20 text-danger",
            label: "Cancelled",
            nextStatus: null,
            actionLabel: "",
            variant: "destructive",
        },
    };

    const config = statusConfig[order.status];

    const { mutateAsync: changeOrderStatus, isPending } = useChangeOrderStatus();

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus | null) => {
        if (!newStatus) return;
        await changeOrderStatus({ id: orderId, status: newStatus });
    };

    return (
        <>
            {config.nextStatus && (
                <Button
                    className="flex-1 w-full"
                    disabled={isPending}
                    isLoading={isPending}
                    variant={config.variant}
                    onClick={() => handleStatusChange(order.id, config.nextStatus)}
                >
                    {config.actionLabel}
                </Button>
            )}
        </>
    );
};

export default OrderProcessingAction;
