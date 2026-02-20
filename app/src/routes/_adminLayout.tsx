import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { Session } from "start-authjs";

export const Route = createFileRoute("/_adminLayout")({
    beforeLoad: ({ context, location }) => {
        if (!context.session) {
            throw redirect({ to: "/auth/signin", search: { callbackUrl: location.href } });
        }
        if (!context.session.user.isAdmin) {
            throw redirect({ to: "/" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { session } = Route.useRouteContext();
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1 flex flex-col">
                <AdminNavbar session={session as unknown as Session} />
                <Outlet />
            </main>
        </SidebarProvider>
    );
}
