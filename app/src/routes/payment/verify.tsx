import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Order } from "@/schemas";
import PaymentLoading from "@/components/store/payment/payment-loading";
import { deleteCookie } from "@/lib/util/cookie";
import { tryCatch } from "@/lib/try-catch";
import { useInvalidate } from "@/lib/hooks/useApi";

export const Route = createFileRoute("/payment/verify")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const searchParams: any = null;
    const reference = searchParams.get("reference");
    const invalidate = useInvalidate();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                toast.error("Invalid payment reference");
                navigate({ to: "/orders" });

                return;
            }

            const { data, error } = await tryCatch<Order>(api.get(`/payment/verify/${reference}`));

            if (error) {
                toast.error(error);
                navigate({ to: "/checkout" });

                return;
            }
            await deleteCookie("_cart_id");
            invalidate("cart");
            navigate({ to: `/order/confirmed/${data?.order_number}` });
        };

        verifyPayment();
    }, [reference, navigate]);

    return <PaymentLoading />;
}
