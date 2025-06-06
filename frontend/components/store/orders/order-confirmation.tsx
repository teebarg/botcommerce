"use client";

import { useRouter } from "next/navigation";

import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
import Pickup from "./order-pickup";
import SuccessConfirmation from "./order-success";

import { Order, PaymentStatus } from "@/types/models";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
};

const OrderConfirmation: React.FC<OrderConfirmationProps> = (props) => {
    const { status } = props;
    const router = useRouter();

    const onContinueShopping = () => {
        router.push("/collections");
    };

    if (props.order.payment_method === "CASH_ON_DELIVERY") {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-2">
                <Pickup onContinueShopping={onContinueShopping} {...props} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-2 bg-content1">
            {status === "SUCCESS" && <SuccessConfirmation onContinueShopping={onContinueShopping} {...props} />}
            {status === "PENDING" && <PendingPayment onContinueShopping={onContinueShopping} {...props} />}
            {status === "FAILED" && <FailedPayment onContinueShopping={onContinueShopping} {...props} />}
        </div>
    );
};

export default OrderConfirmation;
