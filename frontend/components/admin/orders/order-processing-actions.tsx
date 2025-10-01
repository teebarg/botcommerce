"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import PaymentStatusManager from "./order-payment-status";

import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/schemas";
import { useChangeOrderStatus } from "@/lib/hooks/useOrder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface OrderProcessingActionProps {
    order: Order;
}

const OrderProcessingAction: React.FC<OrderProcessingActionProps> = ({ order }) => {
    const statusConfig: Record<
        "PENDING" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED" | "REFUNDED",
        {
            color: string;
            label: string;
            nextStatus: OrderStatus | null;
            actionLabel: string;
            variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
        }
    > = {
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
            nextStatus: "PROCESSING" as const,
            actionLabel: "Mark as Processing",
            variant: "warning",
        },
        PROCESSING: {
            color: "bg-primary/20 text-primary",
            label: "Processing",
            nextStatus: "SHIPPED" as const,
            actionLabel: "Order Packed",
            variant: "secondary",
        },
        SHIPPED: {
            color: "bg-blue-100 text-blue-700",
            label: "Shipped",
            nextStatus: "OUT_FOR_DELIVERY" as const,
            actionLabel: "Mark Out for Delivery",
            variant: "default",
        },
        OUT_FOR_DELIVERY: {
            color: "bg-success/20 text-success",
            label: "Out for Delivery",
            nextStatus: "DELIVERED" as const,
            actionLabel: "Mark Delivered",
            variant: "default",
        },
        DELIVERED: {
            color: "bg-success/20 text-success",
            label: "Delivered",
            nextStatus: null,
            actionLabel: "",
            variant: "destructive",
        },
        CANCELED: {
            color: "bg-danger/20 text-danger",
            label: "Cancelled",
            nextStatus: null,
            actionLabel: "",
            variant: "destructive",
        },
    };

    const stateState = useOverlayTriggerState({});
    const paymentState = useOverlayTriggerState({});
    const config = statusConfig[order.status];

    const { mutateAsync: changeOrderStatus, isPending } = useChangeOrderStatus();

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus | null) => {
        if (!newStatus) return;
        await changeOrderStatus({ id: orderId, status: newStatus });
        stateState.close();
    };

    return (
        <>
            {order.payment_status !== "SUCCESS" && (
                <Dialog open={paymentState.isOpen} onOpenChange={paymentState.setOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex-1 w-full" variant="luxury">
                            Update Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-content1">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Update Payment Status</DialogTitle>
                        </DialogHeader>
                        <PaymentStatusManager
                            currentStatus={order.payment_status}
                            id={order.id}
                            orderNumber={order.order_number}
                            onClose={paymentState.close}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {order.payment_status === "SUCCESS" && config.nextStatus && (
                <Dialog open={stateState.isOpen} onOpenChange={stateState.setOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex-1 w-full" disabled={isPending} isLoading={isPending} variant={config.variant}>
                            {config.actionLabel}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-content1">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Update Order Status</DialogTitle>
                        </DialogHeader>
                        <div className="mx-auto w-full">
                            <div>
                                <h2 className="text-lg font-semibold leading-6 text-default-900">Update Order Status</h2>
                                <Separator />
                                <p className="text-sm text-default-500 mt-2 font-medium">Are you sure you want to change the status of this order?</p>
                                <div className="flex justify-end gap-2 mt-8">
                                    <Button aria-label="close" className="min-w-36" variant="destructive" onClick={stateState.close}>
                                        Close
                                    </Button>
                                    <Button
                                        aria-label="confirm"
                                        className="min-w-36"
                                        isLoading={isPending}
                                        variant="indigo"
                                        onClick={() => handleStatusChange(order.id, config.nextStatus)}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default OrderProcessingAction;
