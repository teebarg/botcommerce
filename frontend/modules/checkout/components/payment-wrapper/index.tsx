"use client";

import React from "react";

import { Cart } from "@/types/models";

type WrapperProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    children: React.ReactNode;
};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    return <div>{children}</div>;
};

export default Wrapper;
