"use client";

import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
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

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-2">
            {status === "COMPLETED" && <SuccessConfirmation {...props} />}
            {status === "PENDING" && <PendingPayment {...props} />}
            {status === "FAILED" && <FailedPayment {...props} />}
        </div>
    );
};

export default OrderConfirmation;
