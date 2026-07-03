import { createServerFn } from "@tanstack/react-start";
import type { Address, Collection } from "@/schemas";
import { z } from "zod";
import { api } from "@/utils/api";

export const CatalogSearchSchema = z.object({
    slug: z.string(),
    sort: z.string().optional(),
    cursor: z.number().optional(),
});

export const getUserAddressesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<{ addresses: Address[] }>("/address/");
});

export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => await api.get<Collection>(`/collection/${data}`));
