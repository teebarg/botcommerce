import { SignInRedirect } from "@/utils/reuseable";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/account")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
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
