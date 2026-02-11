import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useOneTimeConfetti } from "@/hooks/useOneTimeConfetti";
import OrderPickup from "@/components/store/orders/order-pickup";
import SuccessConfirmation from "@/components/store/orders/order-success";
import PendingPayment from "@/components/store/orders/order-pending";
import FailedPayment from "@/components/store/orders/order-failed";
import { orderQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_mainLayout/order/confirmed/$id")({
    loader: async ({ params: { id }, context: { queryClient } }) => {
        try {
            await queryClient.ensureQueryData(orderQuery(id));
        } catch (err) {
            throw new Error("ORDER_NOT_FOUND");
        }
    },
    component: RouteComponent,
    errorComponent: ({ error }) => {
        if (error.message === "ORDER_NOT_FOUND") {
            return (
                <div className="py-24 text-center flex-1">
                    <h1 className="text-xl font-semibold">Order not found</h1>
                    <p className="text-muted-foreground">This order may have expired or does not exist.</p>
                </div>
            );
        }

        throw error;
    },
});

function RouteComponent() {
    const { id } = Route.useParams();
    useOneTimeConfetti(id, "firework");

    const navigate = useNavigate();
    const { data: order } = useSuspenseQuery(orderQuery(id));

    const onContinueShopping = () => {
        navigate({ to: "/collections" });
    };

    if (!order) {
        return <div className="flex items-center justify-center py-12 px-2 bg-secondary">Order not found</div>;
    }

    if (order?.payment_method === "CASH_ON_DELIVERY") {
        return (
            <div className="px-2 pb-8">
                <OrderPickup onContinueShopping={onContinueShopping} order={order} />
            </div>
        );
    }

    return (
        <div className="px-2 pb-8">
            {order?.payment_status === "SUCCESS" && <SuccessConfirmation onContinueShopping={onContinueShopping} order={order} />}
            {order?.payment_status === "PENDING" && <PendingPayment onContinueShopping={onContinueShopping} order={order} />}
            {order?.payment_status === "FAILED" && <FailedPayment onContinueShopping={onContinueShopping} order={order} />}
        </div>
    );
}
