"use client";

import { useRouter } from "next/navigation";

import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
import OrderPickup from "./order-pickup";
import SuccessConfirmation from "./order-success";

import { useOrder } from "@/lib/hooks/useOrder";
import ServerError from "@/components/generic/server-error";
import ComponentLoader from "@/components/component-loader";

type OrderConfirmationProps = {
    orderNumber: string;
    onRetry?: () => void;
};

const OrderConfirmation: React.FC<OrderConfirmationProps> = (props) => {
    const router = useRouter();
    const { data: order, isLoading, error } = useOrder(props.orderNumber);

    const onContinueShopping = () => {
        router.push("/collections");
    };

    if (isLoading) {
        return <ComponentLoader className="h-192" />;
    }

    if (error) {
        return <ServerError />;
    }

    if (!order) {
        return <div className="flex items-center justify-center py-12 px-2 bg-secondary">Order not found</div>;
    }

    if (order?.payment_method === "CASH_ON_DELIVERY") {
        return (
            <div className="min-h-screen flex items-center justify-center px-2">
                <OrderPickup onContinueShopping={onContinueShopping} {...props} order={order} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-2">
            {order?.payment_status === "SUCCESS" && <SuccessConfirmation onContinueShopping={onContinueShopping} {...props} order={order} />}
            {order?.payment_status === "PENDING" && <PendingPayment onContinueShopping={onContinueShopping} {...props} order={order} />}
            {order?.payment_status === "FAILED" && <FailedPayment onContinueShopping={onContinueShopping} {...props} order={order} />}
        </div>
    );
};

export default OrderConfirmation;
