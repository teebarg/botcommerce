"use client";

import { PaystackButton } from "react-paystack";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PaymentLoading from "./payment-loading";

import { Cart, PaystackResponse } from "@/types/models";
import { api } from "@/apis";
import { subtotal, taxTotal, total } from "@/lib/util/store";

const config = {
    reference: new Date().getTime().toString(),
    email: "neyostica2000@yahoo.com",
    amount: 5000, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: "pk_test_a4524c06459fb43786e889c2504a9e3a2011d888",
};

interface PaystackProps {
    cart: Cart;
    isLoggedIn?: boolean;
}

const Paystack: React.FC<PaystackProps> = ({ cart, isLoggedIn }) => {
    const router = useRouter();
    const [onClient, setOnClient] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        setOnClient(true);
    }, []);

    if (!onClient) {
        return null;
    }

    const handleSuccess = async (reference: PaystackResponse) => {
        setIsProcessing(true);
        // Implementation for whatever you want to do with reference and after success call.
        const { data: order, error } = await api.cart.complete({
            total: total(cart.items, cart.shipping_fee),
            subtotal: subtotal(cart.items),
            tax: taxTotal(cart.items),
            payment_status: "SUCCESS",
            status: "PAID",
        });

        if (error || !order) {
            toast.error(error || "Failed to complete order");
            // setSubmitting(false);

            return;
        }

        await api.payment.create({
            order_id: order?.id,
            amount: order?.total,
            reference: reference.reference,
            transaction_id: reference.trxref,
        });

        router.push(`/order/confirmed/${order?.order_number}`);
    };

    const handleClose = () => {
        // implementation for  whatever you want to do when the Paystack dialog closed.
        console.log("closed");
    };

    const componentProps = {
        ...config,
        text: "Paystack Button",
        onSuccess: (reference: PaystackResponse) => handleSuccess(reference),
        onClose: handleClose,
    };

    if (isProcessing) {
        return <PaymentLoading />;
    }

    return (
        <div>
            <PaystackButton className="border border-primary rounded-md px-4 py-2 text-primary" {...componentProps} />
        </div>
    );
};

export default Paystack;
