"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "react-stately";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cart, User } from "@/lib/models";
import { MagicLinkForm } from "@/modules/auth/components/magic-link";
import { api } from "@/apis";
import { subtotal, taxTotal, total } from "@/lib/util/store";

type PaymentButtonProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    user?: User | null;
    "data-testid": string;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart, user, "data-testid": dataTestId }) => {
    // check user
    const notReady = !cart || !cart.shipping_address || !cart.billing_address || !cart.email || !cart.shipping_method || !user;

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    if (paidByGiftcard) {
        return <GiftCardPaymentButton />;
    }

    switch (cart.payment_method) {
        case "CREDIT_CARD":
        case "PAYSTACK":
        case "PAYPAL":
            return <ManualTestPaymentButton cart={cart} data-testid={dataTestId} notReady={notReady} user={user} />;
        case "BANK_TRANSFER":
            return <TransferPaymentButton cart={cart} notReady={notReady} user={user} />;
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
            payment_status: "COMPLETED",
            status: "PENDING",
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

const TransferPaymentButton = ({ cart, notReady, user }: { cart: Cart; notReady: boolean; user?: User | null }) => {
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
        if (user) {
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

const ManualTestPaymentButton = ({ notReady, user, cart }: { notReady: boolean; user?: User | null; cart: Cart }) => {
    const router = useRouter();
    const modalState = useOverlayTriggerState({});

    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (submitting && user) {
            modalState.close();
            onPaymentCompleted();
        }
    }, [user]);

    const onPaymentCompleted = async () => {
        const { data, error } = await api.cart.complete({
            total: total(cart.items, cart.shipping_fee),
            subtotal: subtotal(cart.items),
            tax: taxTotal(cart.items),
            payment_status: "COMPLETED",
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
        if (user) {
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
