import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import PaymentLoading from "@/components/store/payment/payment-loading";
import { useInvalidate } from "@/hooks/useApi";
import z from "zod";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { Order } from "@/schemas";

export const Route = createFileRoute("/payment/verify")({
    validateSearch: z.object({
        reference: z.string(),
    }),
    loaderDeps: ({ search: { reference } }) => ({ reference }),
    component: RouteComponent,
    pendingComponent: PaymentLoading,
});

function RouteComponent() {
    const navigate = useNavigate();
    const invalidate = useInvalidate();
    const { reference } = Route.useSearch();

    const { data, error, isPending } = useQuery({
        queryKey: ["payment", "verify", reference],
        queryFn: () => clientApi.get<Order>(`/payment/verify/${reference}`),
    });

    if (isPending) {
        return <PaymentLoading />;
    }

    if (error) {
        toast.error(error.message);
        navigate({ to: "/checkout" });
    }

    if (data?.payment_status === "SUCCESS") {
        invalidate("cart");
        navigate({ to: `/order/confirmed/${data?.order_number}` });
    }

    return <PaymentLoading />;
}
