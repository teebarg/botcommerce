import { Metadata } from "next";
import React from "react";

import CustomerView from "@/components/admin/customers/customer-view";

export const metadata: Metadata = {
    title: "Customers",
};

export default async function UsersPage() {
    return <CustomerView />;
}
