import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import PaymentStatusManager from "./order-payment-status";
import { Button } from "@/components/ui/button";
import { ButtonVariant, Order, OrderStatus } from "@/schemas";
import { useChangeOrderStatus } from "@/hooks/useOrder";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface OrderProcessingActionProps {
    order: Order;
}

const OrderProcessingAction: React.FC<OrderProcessingActionProps> = ({ order }) => {

    const statusConfig: Record<
        OrderStatus,
        {
            label: string;
            nextStatus: OrderStatus | null;
            actionLabel: string;
            variant: ButtonVariant;
        }
    > = {
        [OrderStatus.REFUNDED]: {
            label: "Refunded",
            nextStatus: null,
            actionLabel: "",
            variant: "destructive",
        },
        [OrderStatus.PENDING]: {
            label: "Pending",
            nextStatus: OrderStatus.PROCESSING,
            actionLabel: "Mark as Processing",
            variant: "warning",
        },
        [OrderStatus.PROCESSING]: {
            label: "Processing",
            nextStatus: OrderStatus.SHIPPED,
            actionLabel: "Order Packed",
            variant: "warning-subtle",
        },
        [OrderStatus.SHIPPED]: {
            label: "Order Packed",
            nextStatus: OrderStatus.OUT_FOR_DELIVERY,
            actionLabel: "Mark Out for Delivery",
            variant: "accent-subtle",
        },
        [OrderStatus.OUT_FOR_DELIVERY]: {
            label: "Out for Delivery",
            nextStatus: OrderStatus.DELIVERED,
            actionLabel: "Mark Delivered",
            variant: "accent",
        },
        [OrderStatus.DELIVERED]: {
            label: "Delivered",
            nextStatus: null,
            actionLabel: "",
            variant: "success",
        },
        [OrderStatus.CANCELED]: {
            label: "Cancelled",
            nextStatus: null,
            actionLabel: "",
            variant: "destructive",
        },
    };

    const stateState = useOverlayTriggerState({});
    const paymentState = useOverlayTriggerState({});
    const config = statusConfig[order.status];
    const hasOutOfStock = order.order_items.some((item) => item.variant?.inventory < 1);

    const { mutateAsync: changeOrderStatus, isPending } = useChangeOrderStatus();

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus | null) => {
        if (!newStatus) return;
        await changeOrderStatus({ id: orderId, status: newStatus });
        stateState.close();
    };

    return (
        <>
            {order.payment_status !== "SUCCESS" && (
                <ConfirmDrawer
                    open={paymentState.isOpen}
                    onOpenChange={paymentState.setOpen}
                    trigger={
                        <Button className="flex-1 w-full" variant="accent">
                            Update Payment
                        </Button>
                    }
                    content={
                        hasOutOfStock ? (
                            <div className="px-4 pb-12">
                                <p className="text-sm text-muted-foreground">
                                    This order has out of stock items. Please resolve the issue before updating the payment status.
                                </p>
                            </div>
                        ) : (
                            <PaymentStatusManager
                                currentStatus={order.payment_status}
                                id={order.id}
                                orderNumber={order.order_number}
                                onClose={paymentState.close}
                            />
                        )
                    }
                    onClose={paymentState.close}
                    title="Update Payment Status"
                    hideActionBtn
                />
            )}
            {order.payment_status === "SUCCESS" && config.nextStatus && (
                <ConfirmDrawer
                    open={stateState.isOpen}
                    onOpenChange={stateState.setOpen}
                    trigger={
                        <Button className="flex-1 w-full" disabled={isPending} isLoading={isPending} variant={config.variant}>
                            {config.actionLabel}
                        </Button>
                    }
                    onClose={stateState.close}
                    onConfirm={() => handleStatusChange(order.id, config.nextStatus)}
                    title="Update Order Status"
                    description="Are you sure you want to update the status of this order?"
                    confirmText="Update"
                    isLoading={isPending}
                />
            )}
        </>
    );
};

export default OrderProcessingAction;
