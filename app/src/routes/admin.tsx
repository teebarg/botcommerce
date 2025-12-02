import { createFileRoute, Outlet } from "@tanstack/react-router";

import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const Route = createFileRoute("/admin")({
    component: AdminLayoutComponent,
});

function AdminLayoutComponent() {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1">
                <AdminNavbar />
                <Outlet />
            </main>
        </SidebarProvider>
    );
}
