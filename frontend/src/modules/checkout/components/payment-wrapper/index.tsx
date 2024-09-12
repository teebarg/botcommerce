"use client";

import React from "react";

type WrapperProps = {
    cart: Omit<any, "refundable_amount" | "refunded_total">;
    children: React.ReactNode;
};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    // const paymentSession = cart.payment_session as PaymentSession;
    return <div>{children}</div>;
};

export default Wrapper;
