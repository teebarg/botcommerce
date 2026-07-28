import { ClerkProvider } from "@clerk/tanstack-react-start";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
    component: () => (
        <ClerkProvider>
            <Outlet />
        </ClerkProvider>
    ),
});