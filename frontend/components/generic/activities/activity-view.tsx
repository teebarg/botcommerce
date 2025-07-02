"use client";

import React from "react";

import { ActivityList } from "@/components/generic/activities/ActivityList";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useActivities } from "@/lib/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeletons";

const ActivityView: React.FC = () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useActivities();

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (!isFetchingNextPage && hasNextPage) {
                fetchNextPage();
            }
        },
    });

    if (isPending) {
        return (
            <div className="max-w-6xl mx-auto py-4 px-1 md:px-6 md:py-12">
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    const activities = data?.pages?.flatMap((page) => page.activities) || [];

    return (
        <div className="px-2 md:px-10 py-8">
            <h1 className="text-2xl font-bold mb-6">Activities History</h1>
            <ActivityList activities={activities} />
            {hasNextPage && <div ref={lastElementRef} className="h-10" />}
            {isFetchingNextPage && <p>Loading more...</p>}
        </div>
    );
};

export default ActivityView;
