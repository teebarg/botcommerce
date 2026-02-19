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
        <div className="flex items-center flex-wrap gap-2 w-full">
            <Overlay
                open={state.isOpen}
                sheetClassName="md:max-w-7xl"
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
            <OrderProcessingAction order={order} />
        </div>
    );
};

export default OrderActions;
