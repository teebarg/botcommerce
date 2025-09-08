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

export const SIZE_OPTIONS = ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"];
export const COLOR_OPTIONS = [
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Gray",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Brown",
    "Cyan",
    "Magenta",
    "Teal",
    "Indigo",
    "Lime",
    "Amber",
    "Ember",
    "Rose",
    "Salmon",
    "Sienna",
    "Slate",
    "Sky",
    "Stone",
    "Sun",
    "Tangerine",
    "Turquoise",
    "Wine",
    "Zinc",
];
