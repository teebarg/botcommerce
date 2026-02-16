import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Collection } from "@/schemas";
import type { CollectionFormValues } from "@/components/admin/collections/collection-form";

// Using z.custom since the schema definitions are not provided
const CollectionFormValuesSchema = z.custom<CollectionFormValues>();

const CollectionUpdateSchema = z.object({
    id: z.number(),
    data: CollectionFormValuesSchema,
});

export const getCollectionFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<Collection>(`/collection/${data}`);
        return res;
    });

export const getCollectionsFn = createServerFn({ method: "GET" })
    .inputValidator(z.string().optional())
    .handler(async ({ data: query }) => {
        return await api.get<Collection[]>("/collection/", { params: { query: query || "" } });
    });

export const createCollectionFn = createServerFn({ method: "POST" })
    .inputValidator(CollectionFormValuesSchema)
    .handler(async ({ data }) => {
        return await api.post<Collection>("/collection/", data);
    });

export const updateCollectionFn = createServerFn({ method: "POST" })
    .inputValidator(CollectionUpdateSchema)
    .handler(async ({ data }) => {
        return await api.patch<Collection>(`/collection/${data.id}`, data.data);
    });

export const deleteCollectionFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Collection>(`/collection/${id}`);
    });
