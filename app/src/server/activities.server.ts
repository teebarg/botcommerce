import { serverApi } from "@/apis/server-client";
import { Activity, PaginatedActivity } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ActivitiesSearchSchema = z.object({
    skip: z.number(),
});

export const getActivitiesFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => ActivitiesSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await serverApi.get<PaginatedActivity>("/activities/", { params: { skip: data.skip, limit: 10 } });
        return res;
    });


export const getMyActivitiesFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => ActivitiesSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await serverApi.get<Activity[]>("/activities/me", { params: { skip: data.skip, limit: 10 } });
        return res;
    });
