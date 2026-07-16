import { createFileRoute } from "@tanstack/react-router";
import { useSettingsQuery } from "@/hooks/useGeneric";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/settings")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useSettingsQuery());
    },
    pendingComponent: () => <PageLoader variant="detail" />
});
