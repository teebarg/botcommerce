import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import PaymentLoading from "@/components/store/payment/payment-loading";
import { useInvalidate } from "@/hooks/useApi";
import z from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { verifyPaymentFn } from "@/server/payment.server";

export const Route = createFileRoute("/payment/verify")({
    validateSearch: z.object({
        reference: z.string(),
    }),
    loaderDeps: ({ search: { reference } }) => ({ reference }),
    loader: async ({ deps: { reference }, context }) => {
        await context.queryClient.ensureQueryData({
            queryKey: ["payment", "verify", reference],
            queryFn: () => verifyPaymentFn({ data: { reference } }),
        });
    },
    component: RouteComponent,
    pendingComponent: PaymentLoading,
});

function RouteComponent() {
    const navigate = useNavigate();
    const invalidate = useInvalidate();
    const { reference } = Route.useSearch();

    const { data, error } = useSuspenseQuery({
        queryKey: ["payment", "verify", reference],
        queryFn: () => verifyPaymentFn({ data: { reference } }),
    });

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
