"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/apis/base";
import { Order } from "@/schemas";
import PaymentLoading from "@/components/store/payment/payment-loading";
import { deleteCookie } from "@/lib/util/cookie";

export default function PaymentVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                toast.error("Invalid payment reference");
                router.push("/orders");

                return;
            }

            const { data, error } = await api.get<Order>(`/payment/verify/${reference}`);

            if (error) {
                toast.error(error);
                router.push("/checkout");

                return;
            }
            await deleteCookie("_cart_id");

            router.push(`/order/confirmed/${data?.order_number}`);
        };

        verifyPayment();
    }, [reference, router]);

    return <PaymentLoading />;
}
