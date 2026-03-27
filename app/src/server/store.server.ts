import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/api.server";
import type { Address, SearchCatalog, Collection } from "@/schemas";
import { z } from "zod";

export const CatalogSearchSchema = z.object({
    slug: z.string(),
    sort: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    cursor: z.number().optional(),
});

export const getCatalogFn = createServerFn()
    .inputValidator((input: unknown) => CatalogSearchSchema.parse(input))
    .handler(async ({ data }) => await api.get<SearchCatalog>(`/catalog/${data.slug}`, { params: { ...data } }));

export const getUserAddressesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<{ addresses: Address[] }>("/address/");
});

export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<Collection>(`/collection/${data}`);
        return res;
    });


