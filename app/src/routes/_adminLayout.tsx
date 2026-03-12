import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { Session } from "start-authjs";
import { SignIn } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/_adminLayout")({
    beforeLoad: ({ context, location }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
        if (!["admin", "super-admin"].includes(context.user.role)) {
            throw redirect({ to: "/" });
        }
    },
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return (
                <div className="flex items-center justify-center p-12">
                    <SignIn routing="hash" forceRedirectUrl={window.location.href} />
                </div>
            );
        }

        throw error;
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
