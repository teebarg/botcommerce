"use client";

import { placeOrder } from "@modules/checkout/actions";
import React, { useEffect, useState } from "react";
import { Cart, Customer, PaymentSession } from "types/global";
import { Modal } from "@modules/common/components/modal";
import { useSnackbar } from "notistack";
import { useOverlayTriggerState } from "react-stately";
import CheckoutLoginForm from "@modules/account/components/login-form";

import { Button } from "@/components/ui/button";

type PaymentButtonProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    customer: Customer;
    "data-testid": string;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart, customer, "data-testid": dataTestId }) => {
    // check customer
    const notReady = !cart || !cart.shipping_address || !cart.billing_address || !cart.email || !cart.shipping_method ? true : false;

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    if (paidByGiftcard) {
        return <GiftCardPaymentButton />;
    }

    const paymentSession = cart.payment_session as PaymentSession;

    switch (paymentSession.id) {
        case "manual":
        case "paystack":
            return <ManualTestPaymentButton customer={customer} data-testid={dataTestId} notReady={notReady} />;
        case "stripe":
            return (
                <Button disabled aria-label="continue">
                    Continue to payment
                </Button>
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
    const [submitting, setSubmitting] = useState(false);

    const handleOrder = async () => {
        setSubmitting(true);
        await placeOrder();
    };

    return (
        <Button aria-label="place order" data-testid="submit-order-button" isLoading={submitting} onClick={handleOrder}>
            Place order
        </Button>
    );
};

const ManualTestPaymentButton = ({ notReady, customer }: { notReady: boolean; customer: Customer }) => {
    const { enqueueSnackbar } = useSnackbar();
    const modalState = useOverlayTriggerState({});

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (submitting && customer) {
            modalState.close();
            onPaymentCompleted();
        }
    }, [customer]);

    const onPaymentCompleted = async () => {
        try {
            await placeOrder();
        } catch (error: any) {
            enqueueSnackbar(error.toString());
            setSubmitting(false);
        }
    };

    const handlePayment = () => {
        if (customer) {
            setSubmitting(true);
            onPaymentCompleted();

            return;
        }
        // Show login modal
        modalState.open();
    };

    return (
        <>
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
            {modalState.isOpen && (
                <Modal data-testid="login-modal" isOpen={modalState.isOpen} size="sm" title="Login" onClose={modalState.close}>
                    <CheckoutLoginForm />
                </Modal>
            )}
        </>
    );
};

export default PaymentButton;
