"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Order } from "@/schemas";
import PaymentLoading from "@/components/store/payment/payment-loading";
import { deleteCookie } from "@/lib/util/cookie";
import { tryCatch } from "@/lib/try-catch";
import { useInvalidate } from "@/lib/hooks/useApi";

export default function PaymentVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");
    const invalidate = useInvalidate();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                toast.error("Invalid payment reference");
                router.push("/orders");

                return;
            }

            const { data, error } = await tryCatch<Order>(api.get(`/payment/verify/${reference}`));

            if (error) {
                toast.error(error);
                router.push("/checkout");

                return;
            }
            await deleteCookie("_cart_id");
            invalidate("cart");
            router.push(`/order/confirmed/${data?.order_number}`);
        };

        verifyPayment();
    }, [reference, router]);

    return <PaymentLoading />;
}
