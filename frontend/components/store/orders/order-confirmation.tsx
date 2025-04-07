"use client";

import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
import Pickup from "./order-pickup";
import SuccessConfirmation from "./order-success";

import { Order, PaymentStatus } from "@/types/models";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

const OrderConfirmation: React.FC<OrderConfirmationProps> = (props) => {
    const { status } = props;

    if (props.order.payment_method === "CASH_ON_DELIVERY") {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-2">
                <Pickup {...props} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-2">
            {status === "SUCCESS" && <SuccessConfirmation {...props} />}
            {status === "PENDING" && <PendingPayment {...props} />}
            {status === "FAILED" && <FailedPayment {...props} />}
        </div>
    );
};

export default OrderConfirmation;
