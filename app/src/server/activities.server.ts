import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Activity, PaginatedActivity } from "@/schemas";

export const ActivitiesSearchSchema = z.object({
    skip: z.number(),
});

export const getActivitiesFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => ActivitiesSearchSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.get<PaginatedActivity>("/activities/", { params: data });
    });

export const getMyActivitiesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<Activity[]>(`/activities/me`);
});

export const deleteActivityFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<void>(`/activities/${id}`);
    });
