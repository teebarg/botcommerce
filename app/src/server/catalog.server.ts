import { serverApi } from "@/apis/server-client";
import { Catalog } from "@/schemas";
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
        const res = await serverApi.get<Catalog>(`/shared/${data.slug}`, { params: { skip: 0, ...data } });
        return res;
    });
