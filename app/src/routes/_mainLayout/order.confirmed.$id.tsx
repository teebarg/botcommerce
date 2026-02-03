import { createFileRoute } from "@tanstack/react-router";
import OrderConfirmation from "@/components/store/orders/order-confirmation";
import { orderQueryOptions } from "@/hooks/useOrder";
import { useOneTimeConfetti } from "@/hooks/useOneTimeConfetti";

export const Route = createFileRoute("/_mainLayout/order/confirmed/$id")({
    loader: async ({ context: { queryClient }, params: { id } }) => {
        try {
            await queryClient.ensureQueryData(orderQueryOptions(id));
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

    return <OrderConfirmation orderNumber={id} />;
}
