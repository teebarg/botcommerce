import React from "react";

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<string, { title: string; description: string; icon: React.JSX.Element | any }> = {
    manual: {
        title: "Bank Transfer",
        description: "Pay directly into our bank account.",
        icon: "🏦", // Placeholder for an icon
    },
    stripe: {
        title: "Stripe",
        // icon: <CreditCard />,
        description: "Checkout securely with Stripe.",
        icon: "🌐", // Placeholder for an icon
    },
    paystack: {
        title: "Paystack",
        description: "Secure payments through Paystack.",
        icon: "💳", // Placeholder for an icon
    },
    PAYSTACK: {
        title: "Paystack",
        description: "Secure payments through Paystack.",
        icon: "🌐", // Placeholder for an icon
    },
    BANK_TRANSFER: {
        title: "Bank Transfer",
        description: "Transfer into our bank account.",
        icon: "🏦", // Placeholder for an icon
    },
    CREDIT_CARD: {
        title: "Debit Card",
        description: "Checkout securely with your Debit card",
        icon: "💳", // Placeholder for an icon
    },
    // Add more payment providers here
};
