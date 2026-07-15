import { createFileRoute } from "@tanstack/react-router";
import { meQuery } from "@/queries/user.queries";

export const Route = createFileRoute("/_mainLayout/account/referrals")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(meQuery())
    },
    pendingComponent: () => (
        <div className="space-y-6 px-2 pt-6 animate-pulse">
            <div className="h-44 bg-gradient-to-r from-secondary to-muted rounded-2xl" />
            <div className="grid grid-cols-3 gap-2">
                <div className="h-24 bg-card border rounded-2xl" />
            </div>
            <div className="h-48 bg-card border rounded-2xl" />
        </div>
    ),
    pendingMs: 100,
});
