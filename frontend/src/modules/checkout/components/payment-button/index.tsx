"use client";

import { placeOrder } from "@modules/checkout/actions";
import React, { useState } from "react";
import Button from "@modules/common/components/button";

import ErrorMessage from "../error-message";
import { Cart } from "types/global";

type PaymentButtonProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    "data-testid": string;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart, "data-testid": dataTestId }) => {
    const notReady = !cart || !cart.shipping_address || !cart.billing_address || !cart.email || !cart.shipping_method ? true : false;

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    if (paidByGiftcard) {
        return <GiftCardPaymentButton />;
    }

    const paymentSession = cart.payment_session as PaymentSession;

    switch (paymentSession.provider_id) {
        case "manual":
            return <ManualTestPaymentButton data-testid={dataTestId} notReady={notReady} />;
        default:
            return <Button disabled>Select a payment method</Button>;
    }
};

const GiftCardPaymentButton = () => {
    const [submitting, setSubmitting] = useState(false);

    const handleOrder = async () => {
        setSubmitting(true);
        await placeOrder();
    };

    return (
        <Button data-testid="submit-order-button" isLoading={submitting} onClick={handleOrder}>
            Place order
        </Button>
    );
};

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onPaymentCompleted = async () => {
        await placeOrder().catch((err) => {
            setErrorMessage(err.toString());
            setSubmitting(false);
        });
    };

    const handlePayment = () => {
        setSubmitting(true);

        onPaymentCompleted();
    };

    return (
        <>
            <Button data-testid="submit-order-button" disabled={notReady} isLoading={submitting} size="lg" onClick={handlePayment}>
                Place order
            </Button>
            <ErrorMessage data-testid="manual-payment-error-message" error={errorMessage} />
        </>
    );
};

export default PaymentButton;
