import { createServerFn } from "@tanstack/react-start";
import type { Address, SearchCatalog, Collection, Category, Order } from "@/schemas";
import { z } from "zod";
import { api } from "@/utils/api";

export const CatalogSearchSchema = z.object({
    slug: z.string(),
    sort: z.string().optional(),
    cursor: z.number().optional(),
});

export const getCatalogFn = createServerFn()
    .inputValidator((input: unknown) => CatalogSearchSchema.parse(input))
    .handler(async ({ data }) => await api.get<SearchCatalog>(`/catalog/${data.slug}`, { params: { sort: data.sort, cursor: data.sort } }));

export const getUserAddressesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<{ addresses: Address[] }>("/address/");
});

export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => await api.get<Collection>(`/collection/${data}`));

export const getCategoriesFn = createServerFn().inputValidator((query?: string) => query).handler(async ({ data }) => await api.get<Category[]>(`/category/`, { params: { query: data } }));

export const getOrderFn = createServerFn().inputValidator((orderNumber: string) => orderNumber).handler(async ({ data }) => api.get<Order>(`/order/${data}`));