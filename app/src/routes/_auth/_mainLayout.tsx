import { Outlet, createFileRoute } from "@tanstack/react-router";
import { StoreLayoutShell } from "@/components/store/store-layout-shell";

export const Route = createFileRoute("/_auth/_mainLayout")({
    component: () => (
        <StoreLayoutShell>
            <Outlet />
        </StoreLayoutShell>
    ),
    errorComponent: ({ error }) => { throw error; },
});
