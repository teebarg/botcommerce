import { Metadata } from "next";
import React from "react";

import ClientOnly from "@/components/client-only";
import CustomerView from "@/components/admin/customers/customer-view";

export const metadata: Metadata = {
    title: "Customers",
};

export default async function UsersPage() {
    return (
        <ClientOnly>
            <CustomerView />
        </ClientOnly>
    );
}
