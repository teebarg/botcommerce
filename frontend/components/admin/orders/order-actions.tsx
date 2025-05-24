"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import OrderDetails from "./order-details";
import OrderProcessingAction from "./order-processing-actions";

import { Button } from "@/components/ui/button";
import { Order } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface OrderActionsProps {
    order: Order;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
    const state = useOverlayTriggerState({});

    return (
        <div className="flex items-center gap-2">
            <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                <DialogTrigger asChild>
                    <Button className="flex-1" variant="outline">
                        View Details
                    </Button>
                </DialogTrigger>
                <DialogContent size="lg" onInteractOutside={state.close}>
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    <OrderDetails order={order} onClose={state.close} />
                </DialogContent>
            </Dialog>
            <OrderProcessingAction order={order} />
        </div>
    );
};

export default OrderActions;
