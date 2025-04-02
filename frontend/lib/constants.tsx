import { Building, CreditCard, ShoppingBag } from "lucide-react";
import React from "react";

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<string, { title: string; description: string; icon: React.JSX.Element | any }> = {
    PAYSTACK: {
        title: "Paystack",
        description: "Fast and secure payments with Paystack",
        icon: <CreditCard className="text-indigo-600" size={20} />,
    },
    BANK_TRANSFER: {
        title: "Bank Transfer",
        description: "Make a direct bank transfer.",
        icon: <Building className="text-indigo-600" size={20} />,
    },
    CREDIT_CARD: {
        title: "Debit Card",
        description: "Checkout securely with your Debit card",
        icon: <CreditCard className="text-indigo-600" size={20} />,
    },
    CASH_ON_DELIVERY: {
        title: "Pay at Pickup",
        description: "Pay in cash or card when you collect your order",
        icon: <ShoppingBag className="text-indigo-600" size={20} />,
    },
    // Add more payment providers here
};
