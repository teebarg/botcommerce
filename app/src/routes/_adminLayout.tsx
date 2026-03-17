import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SignIn } from "@clerk/tanstack-react-start";
import { AdminPendingComponent } from "@/components/admin/layouts/admin-pending";

export const Route = createFileRoute("/_adminLayout")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
        if (!["admin"].includes(context.session.user.role || "")) {
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
    ssr: false,
    pendingComponent: () => <AdminPendingComponent />,
    pendingMs: 100,        // only show pending if takes longer than 100ms
    pendingMinMs: 300,     // keep showing for at least 300ms to avoid flash
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1 flex flex-col">
                <AdminNavbar />
                <Outlet />
            </main>
        </SidebarProvider>
    );
}
