import { SearchCatalog } from "@/schemas";
import { api } from "@/utils/api.server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const CatalogSearchSchema = z.object({
    slug: z.string(),
    sort: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    cursor: z.number().optional(),
});

export const getCatalogFn = createServerFn()
    .inputValidator((input: unknown) => CatalogSearchSchema.parse(input))
    .handler(async ({ data }) => await api.get<SearchCatalog>(`/catalog/${data.slug}`, { params: { ...data } }));
