import { createFileRoute } from "@tanstack/react-router";
import { ActivityItem } from "@/components/generic/activities/ActivityItem";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Activity, PaginatedActivities } from "@/schemas";
import { ActivityIcon } from "lucide-react";
import { activitiesQuery } from "@/queries/admin.queries";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { clientApi } from "@/utils/api.client";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";

export const Route = createFileRoute("/admin/(admin)/activities")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(activitiesQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data } = useSuspenseQuery(activitiesQuery());
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteResource<PaginatedActivities, Activity>({
        queryKey: ["activities", "infinite"],
        queryFn: (cursor) => clientApi.get<PaginatedActivities>("/activities/", { params: { cursor } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: data,
    });

    return (
        <div className="px-2 md:px-10 py-8">
            <h1 className="text-2xl font-bold mb-6">Activities History</h1>
            <div className="max-w-6xl mx-auto py-4 px-1 md:px-6">
                {!isLoading && items.length > 0 && (
                    <InfiniteResourceList
                        items={items}
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        renderItem={(item: Activity) => <ActivityItem key={item.id} activity={item} />}
                    />
                )}
                {!isLoading && items?.length === 0 && (
                    <div className="text-center py-12 bg-secondary">
                        <div className="w-16 h-16 mx-auto mb-4 bg-contrast/10 rounded-full flex items-center justify-center">
                            <ActivityIcon className="w-8 h-8 text-contrast" />
                        </div>
                        <h3 className="text-xl font-medium">No activities yet</h3>
                        <p className="text-muted-foreground">Activities will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
