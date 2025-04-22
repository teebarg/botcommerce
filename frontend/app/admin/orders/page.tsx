import { Metadata } from "next";
import React from "react";

import OrderView from "@/components/admin/orders/order-view";
import ClientOnly from "@/components/client-only";

export const metadata: Metadata = {
    title: "Children clothing",
};

export default async function OrdersPage() {
    return (
        <ClientOnly>
            <OrderView />
        </ClientOnly>
    );
}
