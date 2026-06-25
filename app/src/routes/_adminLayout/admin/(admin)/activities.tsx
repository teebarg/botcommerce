import { createFileRoute } from "@tanstack/react-router";
import { ActivityItem } from "@/components/generic/activities/ActivityItem";
import type { Activity, PaginatedActivities } from "@/schemas";
import { ActivityIcon } from "lucide-react";
import { activitiesQuery } from "@/queries/admin.queries";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { api } from "@/utils/api";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/(admin)/activities")({
    loader: async ({ context: { queryClient } }) => {
        queryClient.prefetchQuery(activitiesQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedActivities, Activity>({
        queryKey: ["activities", "infinite"],
        queryFn: (cursor) => api.get<PaginatedActivities>("/activities/", { params: { cursor } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    return (
        <div className="px-2 py-4">
            <h1 className="font-semibold mb-2 uppercase">Activities</h1>
            <div className="max-w-5xl mx-auto">
                {isPending ? (
                    <PageLoader variant="list" />
                ) : items?.length == 0 ? (
                    <EmptyState
                        title="No activities yet"
                        description="Activities will appear here"
                        icon={ActivityIcon}
                    />
                ) : (
                    <InfiniteResourceList
                        items={items}
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        renderItem={(item: Activity) => <ActivityItem key={item.id} activity={item} />}
                    />
                )}
            </div>
        </div>
    );
}
