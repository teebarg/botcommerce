import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import PaymentLoading from "@/components/store/payment/payment-loading";
import z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
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
    const queryClient = useQueryClient();
    const { reference } = Route.useSearch();

    const { data, error, isPending } = useQuery({
        queryKey: ["payment", "verify", reference],
        queryFn: () => api.get<Order>(`/payment/verify/${reference}`),
    });

    if (isPending) {
        return <PaymentLoading />;
    }

    if (error) {
        toast.error(error.message);
        navigate({ to: "/checkout" });
    }

    if (data?.payment_status === "SUCCESS") {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigate({ to: `/order/confirmed/${data?.order_number}` });
    }

    return <PaymentLoading />;
}
