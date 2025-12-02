import React from "react";

import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

export default async function PageLayout(props: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1">
                <AdminNavbar />
                {props.children}
            </main>
        </SidebarProvider>
    );
}
