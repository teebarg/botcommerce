"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cart } from "@/types/models";
import { MagicLinkForm } from "@/modules/auth/components/magic-link";
import { api } from "@/apis";
import { subtotal, taxTotal, total } from "@/lib/util/store";
import { PaystackPayment } from "@/components/payment/paystack-payment";

type PaymentButtonProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    isLoggedIn: boolean;
    "data-testid": string;
};

type PaymentProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    isLoggedIn: boolean;
    notReady: boolean;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart, isLoggedIn, "data-testid": dataTestId }) => {
    const searchParams = useSearchParams();

    const isOpen = searchParams.get("step") === "review";
    // check user
    const notReady = !cart || !cart.shipping_address || !cart.billing_address || !cart.email || !cart.shipping_method || !isLoggedIn || !isOpen;

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    if (notReady) {
        return null;
    }

    if (paidByGiftcard) {
        return <GiftCardPaymentButton />;
    }

    switch (cart.payment_method) {
        case "CREDIT_CARD":
            return <ManualTestPaymentButton cart={cart} data-testid={dataTestId} isLoggedIn={isLoggedIn} notReady={notReady} />;
        case "BANK_TRANSFER":
            return <TransferPaymentButton cart={cart} isLoggedIn={isLoggedIn} notReady={notReady} />;
        case "PAYSTACK":
            return (
                <>
                    <PaystackPayment amount={cart.total} cartNumber={cart.cart_number} />
                </>
            );
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
            total: 0,
            subtotal: 0,
            tax: 0,
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

const TransferPaymentButton: React.FC<PaymentProps> = ({ cart, notReady, isLoggedIn }) => {
    const modalState = useOverlayTriggerState({});
    const router = useRouter();
    const pathname = usePathname();

    const [submitting, setSubmitting] = useState<boolean>(false);

    const onPaymentCompleted = async () => {
        // const total = subtotal + cart.shipping_fee + taxTotal;

        const { data, error } = await api.cart.complete({
            total: total(cart.items, cart.shipping_fee),
            subtotal: subtotal(cart.items),
            tax: taxTotal(cart.items),
            payment_status: "PENDING",
            status: "PENDING",
        });

        if (error) {
            toast.error(error);
            setSubmitting(false);

            return;
        }

        router.push(`/order/confirmed/${data?.order_number}`);
    };

    const completeOrder = () => {
        if (isLoggedIn) {
            setSubmitting(true);
            onPaymentCompleted();

            return;
        }
        // Show login modal
        modalState.open();
    };

    return (
        <>
            <Dialog open={modalState.isOpen} onOpenChange={modalState.setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login</DialogTitle>
                    </DialogHeader>
                    <MagicLinkForm callbackUrl={pathname} />
                </DialogContent>
            </Dialog>
            <Button
                className="min-w-32"
                color="danger"
                data-testid="submit-order-button"
                disabled={notReady}
                isLoading={submitting}
                size="sm"
                onClick={completeOrder}
            >
                Place order Transfer
            </Button>
        </>
    );
};

const ManualTestPaymentButton: React.FC<PaymentProps> = ({ notReady, cart, isLoggedIn }) => {
    const router = useRouter();
    const modalState = useOverlayTriggerState({});

    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (submitting && isLoggedIn) {
            modalState.close();
            onPaymentCompleted();
        }
    }, [isLoggedIn]);

    const onPaymentCompleted = async () => {
        const { data, error } = await api.cart.complete({
            total: total(cart.items, cart.shipping_fee),
            subtotal: subtotal(cart.items),
            tax: taxTotal(cart.items),
            payment_status: "SUCCESS",
            status: "PENDING",
        });

        if (error) {
            toast.error(error);
            setSubmitting(false);

            return;
        }

        router.push(`/order/confirmed/${data?.order_number}`);
    };

    const handlePayment = () => {
        if (isLoggedIn) {
            setSubmitting(true);
            onPaymentCompleted();

            return;
        }
        // Show login modal
        modalState.open();
    };

    return (
        <>
            <Dialog open={modalState.isOpen} onOpenChange={modalState.setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login</DialogTitle>
                    </DialogHeader>
                    <MagicLinkForm />
                </DialogContent>
            </Dialog>
            <Button
                className="min-w-32"
                color="danger"
                data-testid="submit-order-button"
                disabled={notReady}
                isLoading={submitting}
                size="sm"
                onClick={handlePayment}
            >
                Place order
            </Button>
        </>
    );
};

export default PaymentButton;
