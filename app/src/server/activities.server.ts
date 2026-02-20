import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import type { Activity, PaginatedActivities } from "@/schemas";

export const getActivitiesFn = createServerFn().handler(async () => {
    return await api.get<PaginatedActivities>("/activities/");
});

export const getMyActivitiesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Activity[]>(`/activities/me`);
});
