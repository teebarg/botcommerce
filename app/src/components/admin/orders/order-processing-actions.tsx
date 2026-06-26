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

const statusConfig: Record<OrderStatus, { nextStatus: OrderStatus | null; actionLabel: string; variant: ButtonVariant }> = {
    [OrderStatus.REFUNDED]: { nextStatus: null, actionLabel: "", variant: "destructive" },
    [OrderStatus.PENDING]: { nextStatus: OrderStatus.PROCESSING, actionLabel: "Mark as Processing", variant: "warning" },
    [OrderStatus.PROCESSING]: { nextStatus: OrderStatus.SHIPPED, actionLabel: "Order Packed", variant: "warning-subtle" },
    [OrderStatus.SHIPPED]: { nextStatus: OrderStatus.OUT_FOR_DELIVERY, actionLabel: "Mark Out for Delivery", variant: "accent-subtle" },
    [OrderStatus.OUT_FOR_DELIVERY]: { nextStatus: OrderStatus.DELIVERED, actionLabel: "Mark Delivered", variant: "accent" },
    [OrderStatus.DELIVERED]: { nextStatus: null, actionLabel: "", variant: "success" },
    [OrderStatus.CANCELED]: { nextStatus: null, actionLabel: "", variant: "destructive" },
};

const OrderProcessingAction: React.FC<OrderProcessingActionProps> = ({ order }) => {
    const stateState = useOverlayTriggerState({});
    const paymentState = useOverlayTriggerState({});
    const config = statusConfig[order.status];
    const hasOutOfStock = order.order_items.some((item) => item.variant?.inventory < 1);
    const { mutateAsync: changeOrderStatus, isPending } = useChangeOrderStatus();

    const handleStatusChange = async () => {
        if (!config.nextStatus) return;
        changeOrderStatus({ id: order.id, status: config.nextStatus }).then(() => {
            stateState.close();
        });
    };

    if (order.payment_status !== "SUCCESS") {
        return (
            <ConfirmDrawer
                open={paymentState.isOpen}
                onOpenChange={paymentState.setOpen}
                trigger={
                    <Button variant="warning-subtle" size="sm" className="rounded-full text-xs">
                        Update payment
                    </Button>
                }
                content={
                    hasOutOfStock ? (
                        <div className="px-4 pb-12">
                            <p className="text-sm text-muted-foreground">
                                This order has out of stock items. Please resolve before updating payment status.
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
        );
    }

    if (config.nextStatus) {
        return (
            <ConfirmDrawer
                open={stateState.isOpen}
                onOpenChange={stateState.setOpen}
                trigger={
                    <Button size="sm" className="rounded-full text-xs" disabled={isPending} isLoading={isPending}>
                        {config.actionLabel}
                    </Button>
                }
                onClose={stateState.close}
                onConfirm={handleStatusChange}
                title="Update Order Status"
                description="Are you sure you want to update the status of this order?"
                confirmText="Update"
                isLoading={isPending}
            />
        );
    }

    return null;
};

export default OrderProcessingAction;