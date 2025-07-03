import { Metadata } from "next";
import React from "react";

import RecentOrdersList from "@/components/admin/dashboard";
import StatComponent from "@/components/admin/dashboard/stat-component";

export const metadata: Metadata = {
    title: "Admin",
    description: "Admin dashboard",
};

export default async function AdminPage() {
    return (
        <div>
            <StatComponent />
            <RecentOrdersList />
        </div>
    );
}
