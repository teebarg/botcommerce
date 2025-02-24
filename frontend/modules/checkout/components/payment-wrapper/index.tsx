"use client";

import React from "react";

import { Cart } from "@/lib/models";

type WrapperProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    children: React.ReactNode;
};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    // const paymentSession = cart.payment_session as PaymentSession;
    return <div>{children}</div>;
};

export default Wrapper;
