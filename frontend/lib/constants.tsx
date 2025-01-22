import React from "react";
import { CreditCard } from "nui-react-icons";

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<string, { title: string; icon: React.JSX.Element }> = {
    manual: {
        title: "Bank Transfer",
        icon: <CreditCard />,
    },
    stripe: {
        title: "Stripe",
        icon: <CreditCard />,
    },
    // Add more payment providers here
};
