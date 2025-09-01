import { Building, CreditCard, ShoppingBag } from "lucide-react";
import React from "react";

export const paymentInfoMap: Record<string, { title: string; description: string; icon: React.JSX.Element | any }> = {
    PAYSTACK: {
        title: "Paystack",
        description: "Fast and secure payments",
        icon: <CreditCard size={20} />,
    },
    BANK_TRANSFER: {
        title: "Bank Transfer",
        description: "Make a direct bank transfer.",
        icon: <Building size={20} />,
    },
    CREDIT_CARD: {
        title: "Debit Card",
        description: "Checkout securely with your Debit card",
        icon: <CreditCard size={20} />,
    },
    CASH_ON_DELIVERY: {
        title: "Pay at Pickup",
        description: "Pay when you pick up your order",
        icon: <ShoppingBag size={20} />,
    },
};

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
export const COLOR_OPTIONS = ["Red", "Blue", "Green", "Black", "White"];
export const MEASUREMENT_OPTIONS = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
