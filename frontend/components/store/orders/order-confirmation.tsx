"use client";

import { notFound, useRouter } from "next/navigation";

import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
import OrderPickup from "./order-pickup";
import SuccessConfirmation from "./order-success";

import { useOrder } from "@/lib/hooks/useOrder";
import { Skeleton } from "@/components/ui/skeletons";

type OrderConfirmationProps = {
    orderId: number;
    onRetry?: () => void;
};

const OrderConfirmation: React.FC<OrderConfirmationProps> = (props) => {
    const router = useRouter();
    const { data: order, isLoading } = useOrder(props.orderId);

    const onContinueShopping = () => {
        router.push("/collections");
    };

    if (isLoading) {
        return <Skeleton className="h-192" />;
    }

    if (!order) {
        return notFound();
    }

    if (order?.payment_method === "CASH_ON_DELIVERY") {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-2 bg-content1">
                <OrderPickup onContinueShopping={onContinueShopping} {...props} order={order} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-2 bg-content1">
            {order?.payment_status === "SUCCESS" && <SuccessConfirmation onContinueShopping={onContinueShopping} {...props} order={order} />}
            {order?.payment_status === "PENDING" && <PendingPayment onContinueShopping={onContinueShopping} {...props} order={order} />}
            {order?.payment_status === "FAILED" && <FailedPayment onContinueShopping={onContinueShopping} {...props} order={order} />}
        </div>
    );
};

export default OrderConfirmation;
