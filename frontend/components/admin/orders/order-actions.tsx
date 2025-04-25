"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types/models";

interface OrderActionsProps {
    order: Order;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
    const router = useRouter();

    const statusConfig: Record<
        "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED" | "PAID" | "REFUNDED",
        { color: string; label: string; nextStatus: OrderStatus | null; actionLabel: string }
    > = {
        PAID: {
            color: "bg-success/20 text-success",
            label: "Paid",
            nextStatus: "PROCESSING" as const,
            actionLabel: "Process Order",
        },
        REFUNDED: {
            color: "bg-danger/20 text-danger",
            label: "Refunded",
            nextStatus: null,
            actionLabel: "",
        },
        PENDING: {
            color: "bg-warning/20 text-warning",
            label: "Pending",
            nextStatus: "PROCESSING" as const,
            actionLabel: "Process Order",
        },
        PROCESSING: {
            color: "bg-primary/20 text-primary",
            label: "Processing",
            nextStatus: "SHIPPED" as const,
            actionLabel: "Mark Shipped",
        },
        SHIPPED: {
            color: "bg-blue-100 text-blue-700",
            label: "Shipped",
            nextStatus: "DELIVERED" as const,
            actionLabel: "Mark Delivered",
        },
        DELIVERED: {
            color: "bg-success/20 text-success",
            label: "Delivered",
            nextStatus: null,
            actionLabel: "",
        },
        CANCELED: {
            color: "bg-danger/20 text-danger",
            label: "Cancelled",
            nextStatus: null,
            actionLabel: "",
        },
    };

    const config = statusConfig[order.status];

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus | null) => {
        if (!newStatus) return;
        try {
            // switch (newStatus) {
            //     case OrderStatus.CANCELLED:
            //         await orderApi.cancel(orderId);
            //         break;
            //     case OrderStatus.FULFILLED:
            //         await orderApi.fulfill(orderId);
            //         break;
            //     case OrderStatus.REFUNDED:
            //         await orderApi.refund(orderId);
            //         break;
            // }
            toast.success("Order status updated successfully");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button className="flex-1" size="sm" variant="outline" onClick={() => router.push(`/admin/orders/${order.order_number}`)}>
                View Details
            </Button>

            {config.nextStatus && (
                <Button className="flex-1" variant="default" onClick={() => handleStatusChange(order.id, config.nextStatus)}>
                    {config.actionLabel}
                </Button>
            )}
        </div>
    );
};

export default OrderActions;
