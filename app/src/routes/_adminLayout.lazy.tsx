import { createLazyFileRoute, Outlet } from '@tanstack/react-router'
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const Route = createLazyFileRoute('/_adminLayout')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1 flex flex-col">
                <AdminNavbar />
                <div className="flex-1 flex flex-col">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}
