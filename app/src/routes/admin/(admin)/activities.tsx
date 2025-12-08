import { createFileRoute } from "@tanstack/react-router";

import { ActivityListItem } from "@/components/generic/activities/ActivityList";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getActivitiesFn } from "@/server/activities.server";
import type { Activity } from "@/schemas";
import { ActivityIcon } from "lucide-react";
import z from "zod";
import PaginationUI from "@/components/pagination";

const activitiesQueryOptions = (skip: number = 0) => ({
    queryKey: ["activities"],
    queryFn: () => getActivitiesFn({ data: { skip } }),
});

export const Route = createFileRoute("/admin/(admin)/activities")({
    validateSearch: z.object({
        skip: z.number().optional(),
    }),
    loaderDeps: ({ search: { skip } }) => ({ skip }),
    loader: async ({ deps: { skip }, context: { queryClient } }) => {
        await queryClient.ensureQueryData(activitiesQueryOptions(skip));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { skip = 0 } = Route.useSearch();
    const { data } = useSuspenseQuery(activitiesQueryOptions(skip));
    const { activities, ...pagination } = data ?? { skip: 0, limit: 0, total_pages: 0, total_count: 0 };

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
            <div className="max-w-6xl mx-auto py-4 px-1 md:px-6 md:py-12">
                <div className="space-y-2 sm:space-y-6">
                    {activities.map((activity: Activity, idx: number) => (
                        <ActivityListItem key={idx} activity={activity} />
                    ))}
                </div>
                {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
            </div>
        </div>
    );
}
