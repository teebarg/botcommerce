import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import OrderDetails from "./order-details";
import OrderProcessingAction from "./order-processing-actions";
import { Button } from "@/components/ui/button";
import type { Order } from "@/schemas";
import Overlay from "@/components/overlay";

interface OrderActionsProps {
    order: Order;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
    const state = useOverlayTriggerState({});

    return (
        <div className="flex items-center gap-2">
            <Overlay
                open={state.isOpen}
                sheetClassName="md:max-w-7xl"
                title="Order Details"
                trigger={
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={state.open}
                    >
                        View details
                    </Button>
                }
                onOpenChange={state.setOpen}
            >
                {state.isOpen && <OrderDetails order={order} onClose={state.close} />}
            </Overlay>
            <OrderProcessingAction order={order} />
        </div>
    );
};

export default OrderActions;
