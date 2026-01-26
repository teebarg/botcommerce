import { type Catalog } from "@/schemas";
import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const CatalogSearchSchema = z.object({
    slug: z.string(),
    limit: z.number().optional(),
    sort: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
});

export const getCatalogFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => CatalogSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await api.get<Catalog>(`/shared/${data.slug}`, { params: { skip: 0, ...data } });
        return res;
    });

interface VisitTrackerResponse {
    success: boolean;
    is_new_visit: boolean;
    view_count: number;
}

export const trackVisitFn = createServerFn({ method: "POST" })
    .inputValidator((d: string) => d)
    .handler(async ({ data: slug }) => {
        return await api.post<VisitTrackerResponse>(`/shared/${slug}/track-visit`);
    });
