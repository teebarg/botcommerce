import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SignInRedirect } from "@/components/auth/redirect";

export const Route = createFileRoute("/_auth/_adminLayout")({
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
    ssr: false,
    component: () => <Outlet />,
});
