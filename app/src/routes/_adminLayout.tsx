import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SignIn } from "@clerk/tanstack-react-start";

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
                    <SignIn routing="hash" forceRedirectUrl={`/auth/callback?redirect=${window.location.pathname}`} />
                </div>
            );
        }

        throw error;
    },
    ssr: false,
    pendingMs: 100,
    pendingMinMs: 300,
    component: RouteComponent,
});

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
