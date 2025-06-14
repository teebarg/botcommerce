import { api } from "./base";

import { Activity, PaginatedActivity } from "@/schemas";
import { ApiResult } from "@/lib/try-catch";

export const activitiesApi = {
    getMyActivities: async (): ApiResult<Activity[]> => {
        return await api.get<Activity[]>(`/activities/me`, { cache: "default" });
    },
    getActivities: async (skip = 0, limit = 20): ApiResult<PaginatedActivity> => {
        return await api.get<PaginatedActivity>(`/activities/?skip=${skip}&limit=${limit}`, { params: { skip, limit }, cache: "default" });
    },
    deleteActivity: async (id: number): ApiResult<void> => {
        return await api.delete<void>(`/activities/${id}`);
    },
};
