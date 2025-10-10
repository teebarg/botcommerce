"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import OrderDetails from "./order-details";
import OrderProcessingAction from "./order-processing-actions";

import { Button } from "@/components/ui/button";
import { Order } from "@/schemas";
import Overlay from "@/components/overlay";

interface OrderActionsProps {
    order: Order;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
    const state = useOverlayTriggerState({});
    const hasOutOfStock = order.order_items.some((item) => item.variant?.inventory < 1);

    return (
        <div className="flex items-center flex-wrap gap-2">
            <Overlay
                open={state.isOpen}
                sheetClassName="min-w-[70vw]"
                title="Order Details"
                trigger={
                    <Button className="flex-1" onClick={state.open}>
                        View Details
                    </Button>
                }
                onOpenChange={state.setOpen}
            >
                <OrderDetails order={order} onClose={() => state.close()} />
            </Overlay>
            <OrderProcessingAction order={order} hasOutOfStock={hasOutOfStock} />
        </div>
    );
};

export default OrderActions;
