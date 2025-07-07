"use client";

import React from "react";

import { ActivityList } from "@/components/generic/activities/ActivityList";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useActivities } from "@/lib/hooks/useActivities";
import ComponentLoader from "@/components/component-loader";

const ActivityView: React.FC = () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useActivities();

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (!isFetchingNextPage && hasNextPage) {
                fetchNextPage();
            }
        },
    });

    const activities = data?.pages?.flatMap((page) => page.activities) || [];

    return (
        <div className="px-2 md:px-10 py-8">
            <h1 className="text-2xl font-bold mb-6">Activities History</h1>
            {isPending ? <ComponentLoader className="h-[70vh]" /> : <ActivityList activities={activities} />}
            {hasNextPage && <div ref={lastElementRef} className="h-10" />}
            {isFetchingNextPage && <ComponentLoader className="h-[100px]" />}
        </div>
    );
};

export default ActivityView;
