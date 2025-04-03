"use client";

import React, { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cart } from "@/types/models";
import { MagicLinkForm } from "@/modules/auth/components/magic-link";
import { api } from "@/apis";
import { PaystackPayment } from "@/components/payment/paystack-payment";
import BankTransfer from "@/components/payment/bank-transfer";
import Pickup from "@/components/payment/pickup";

type PaymentButtonProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    isLoggedIn: boolean;
    "data-testid": string;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart, isLoggedIn, "data-testid": dataTestId }) => {
    const searchParams = useSearchParams();

    const isOpen = searchParams.get("step") === "review";
    const notReady = !cart || !cart.shipping_address || !cart.email || !cart.shipping_method || !isOpen;

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    if (notReady) {
        return null;
    }

    if (!isLoggedIn) {
        return <LoginToCompleteOrder />;
    }

    if (paidByGiftcard) {
        return <GiftCardPaymentButton />;
    }

    switch (cart.payment_method) {
        case "BANK_TRANSFER":
            return <BankTransfer amount={cart.total} />;
        case "CASH_ON_DELIVERY":
            return <Pickup amount={cart.total} />;
        case "CREDIT_CARD":
        case "PAYSTACK":
            return <PaystackPayment amount={cart.total} cartNumber={cart.cart_number} />;
        default:
            return (
                <Button disabled aria-label="default">
                    Select a payment method
                </Button>
            );
    }
};

const GiftCardPaymentButton = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleOrder = async () => {
        setSubmitting(true);
        const { data, error } = await api.cart.complete({
            payment_status: "SUCCESS",
            status: "PAID",
        });

        if (error) {
            toast.error(error);
            setSubmitting(false);

            return;
        }

        router.push(`/order/confirmed/${data?.order_number}`);
    };

    return (
        <Button aria-label="place order" data-testid="submit-order-button" isLoading={submitting} onClick={handleOrder}>
            Place order
        </Button>
    );
};

const LoginToCompleteOrder: React.FC = () => {
    const modalState = useOverlayTriggerState({});
    const pathname = usePathname();

    return (
        <Dialog open={modalState.isOpen} onOpenChange={modalState.setOpen}>
            <DialogTrigger asChild>
                <Button className="min-w-32" color="danger" size="sm">
                    Login to complete order
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                </DialogHeader>
                <MagicLinkForm callbackUrl={pathname} />
            </DialogContent>
        </Dialog>
    );
};

export default PaymentButton;
