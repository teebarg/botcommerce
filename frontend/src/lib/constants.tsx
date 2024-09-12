import React from "react";
import { CreditCard } from "nui-react-icons";

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<string, { title: string; icon: React.JSX.Element }> = {
    manual: {
        title: "Test payment",
        icon: <CreditCard />,
    },
    // Add more payment providers here
};

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
    "krw",
    "jpy",
    "vnd",
    "clp",
    "pyg",
    "xaf",
    "xof",
    "bif",
    "djf",
    "gnf",
    "kmf",
    "mga",
    "rwf",
    "xpf",
    "htg",
    "vuv",
    "xag",
    "xdr",
    "xau",
];
