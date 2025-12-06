import { createFileRoute } from "@tanstack/react-router";

import { ActivityListItem } from "@/components/generic/activities/ActivityList";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getActivitiesFn } from "@/server/activities.server";
import { Activity, PaginatedActivity } from "@/schemas";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { ActivityIcon, Loader } from "lucide-react";

const activitiesQueryOptions = () => ({
    queryKey: ["activities"],
    queryFn: () => getActivitiesFn({ data: { skip: 0 } }),
});

export const Route = createFileRoute("/admin/(admin)/activities")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(activitiesQueryOptions());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: catalog } = useSuspenseQuery(activitiesQueryOptions());
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["activities"],
        queryFn: ({ pageParam = 0 }) => getActivitiesFn({ data: { skip: pageParam } }),
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginatedActivity) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < (lastPage.total_count || 0);

            return hasMore ? nextSkip : undefined;
        },
        initialData: { pages: [catalog], pageParams: [0] },
    });

    const activities = data?.pages?.flatMap((page) => page.activities) || [];

    if (activities && !activities?.length) {
        return (
            <div className="px-2 md:px-10 py-8">
                <h1 className="text-2xl font-bold mb-6">Activities History</h1>
                <div className="text-center py-12 bg-secondary">
                    <div className="w-16 h-16 mx-auto mb-4 bg-contrast/10 rounded-full flex items-center justify-center">
                        <ActivityIcon className="w-8 h-8 text-contrast" />
                    </div>
                    <h3 className="text-xl font-medium">No activities yet</h3>
                    <p className="text-muted-foreground">Activities will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 md:px-10 py-8">
            <h1 className="text-2xl font-bold mb-6">Activities History</h1>
            <InfiniteScroll
                onLoadMore={fetchNextPage}
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                loader={
                    <div className="flex flex-col items-center justify-center text-blue-600">
                        <Loader className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Loading more products...</p>
                    </div>
                }
                endMessage={<div className="text-center py-8 text-muted-foreground">You've viewed all products</div>}
            >
                <div className="max-w-6xl mx-auto py-4 px-1 md:px-6 md:py-12">
                    <div className="space-y-2 sm:space-y-6">
                        {activities.map((activity: Activity, idx: number) => (
                            <ActivityListItem key={idx} activity={activity} />
                        ))}
                    </div>
                </div>
            </InfiniteScroll>
        </div>
    );
}
