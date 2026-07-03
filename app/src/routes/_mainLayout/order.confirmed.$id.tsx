import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useOneTimeConfetti } from "@/hooks/useOneTimeConfetti";
import OrderPickup from "@/components/store/orders/order-pickup";
import SuccessConfirmation from "@/components/store/orders/order-success";
import PendingPayment from "@/components/store/orders/order-pending";
import FailedPayment from "@/components/store/orders/order-failed";
import { PaymentMethod } from "@/schemas";
import OrderStatusLoader from "@/components/store/orders/order-loader";
import NotFound from "@/components/generic/not-found";
import { Receipt } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";

export const Route = createFileRoute("/_mainLayout/order/confirmed/$id")({
    component: RouteComponent,
});

function RouteComponent() {
    const { id } = Route.useParams();
    const { data: order, error, isPending } = useOrder(id);
    useOneTimeConfetti(id, "firework");

    const navigate = useNavigate();

    const onContinueShopping = () => {
        navigate({ to: "/collections" });
    };

    if (isPending) {
        return <OrderStatusLoader />
    }

    if (error) {
        return (
            <NotFound
                icon={Receipt}
                eyebrow="Order unavailable"
                title="Order not found"
                description="This order may have expired or does not exist."
                primaryAction={{ label: "View your orders", to: "/account/orders" }}
                quickLinks={[
                    { to: "/account/orders", label: "My orders" },
                    { to: "/collections", label: "Continue shopping" },
                    { to: "/contact", label: "Contact support" },
                ]}
            />
        )
    }

    if (order?.payment_method === PaymentMethod.CASH_ON_DELIVERY) {
        return (
            <div className="px-2 pb-8">
                <OrderPickup onContinueShopping={onContinueShopping} order={order} />
            </div>
        );
    }

    return (
        <div className="px-2 pb-2">
            {order?.payment_status === "SUCCESS" && <SuccessConfirmation onContinueShopping={onContinueShopping} order={order} />}
            {order?.payment_status === "PENDING" && <PendingPayment onContinueShopping={onContinueShopping} order={order} />}
            {order?.payment_status === "FAILED" && <FailedPayment onContinueShopping={onContinueShopping} order={order} />}
        </div>
    );
}
