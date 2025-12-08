import { createFileRoute } from "@tanstack/react-router";
import OrderConfirmation from "@/components/store/orders/order-confirmation";
import { orderQueryOptions } from "@/hooks/useOrder";

export const Route = createFileRoute("/_mainLayout/order/confirmed/$id")({
    loader: async ({ context: { queryClient }, params: { id } }) => {
        await queryClient.ensureQueryData(orderQueryOptions(id));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { id } = Route.useParams();

    return <OrderConfirmation orderNumber={id} />;
}
