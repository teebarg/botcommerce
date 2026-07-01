import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AdminNavbar from "@/components/admin/layouts/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SignInRedirect } from "@/utils/reuseable";

export const Route = createFileRoute("/_adminLayout")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
        if (!context.isAdmin) {
            throw redirect({ to: "/" });
        }
    },
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <SignInRedirect />;
        }

        throw error;
    },
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
