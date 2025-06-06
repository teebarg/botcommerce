"use client";

import React, { useEffect, useState } from "react";

import { ActivityList } from "@/components/generic/activities/ActivityList";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { api } from "@/apis";
import { Activity } from "@/types/models";

const ActivityView: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const limit = 10;

    const loadActivities = async () => {
        const { data, error } = await api.activities.getActivities(page * limit, limit);

        if (!data || error) {
            setIsLoading(false);

            return;
        }

        const { activities } = data;

        setActivities((prev) => [...prev, ...activities]);
        setHasMore(activities.length === limit);
        setPage((prev) => prev + 1);
        setIsLoading(false);
    };

    const onRemove = async (id: number) => {
        setActivities((prev) => prev.filter((activity) => activity.id !== id));
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const { lastElementRef } = useInfiniteScroll({
        onIntersect: () => {
            if (!isLoading && hasMore) {
                loadActivities();
            }
        },
    });

    return (
        <div className="px-2 md:px-10 py-8">
            <h1 className="text-2xl font-bold mb-6">Activities History</h1>
            <ActivityList activities={activities} isLoading={isLoading} onRemove={onRemove} />
            {hasMore && <div ref={lastElementRef} className="h-10" />}
        </div>
    );
};

export default ActivityView;
