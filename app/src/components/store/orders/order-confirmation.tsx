import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
import OrderPickup from "./order-pickup";
import SuccessConfirmation from "./order-success";

import { orderQueryOptions } from "@/hooks/useOrder";
import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

type OrderConfirmationProps = {
    orderNumber: string;
    onRetry?: () => void;
};

const OrderConfirmation: React.FC<OrderConfirmationProps> = (props) => {
    const navigate = useNavigate();
    const { data: order } = useSuspenseQuery(orderQueryOptions(props.orderNumber));

    const onContinueShopping = () => {
        navigate({to: "/collections"});
    };

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
