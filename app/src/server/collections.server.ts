import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Collection, PaginatedShared, Shared } from "@/schemas";
import type { CollectionFormValues } from "@/components/admin/collections/collection-form";
import type { SharedFormValues } from "@/components/admin/shared-collections/shared-form";

// Using z.custom since the schema definitions are not provided
const CollectionFormValuesSchema = z.custom<CollectionFormValues>();
const SharedFormValuesSchema = z.custom<SharedFormValues>();

const CollectionUpdateSchema = z.object({
    id: z.number(),
    data: CollectionFormValuesSchema,
});

const SharedUpdateSchema = z.object({
    id: z.number(),
    data: SharedFormValuesSchema,
});

const AddRemoveProductSchema = z.object({
    collectionId: z.number(),
    productId: z.number(),
});

const BulkAddProductsSchema = z.object({
    collectionId: z.number(),
    productIds: z.array(z.number()),
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

// --- Shared Collection (Catalog) Hooks ---
export const getCatalogsFn = createServerFn({ method: "GET" })
    .inputValidator(z.boolean().optional()) // is_active
    .handler(async ({ data: is_active }) => {
        return await api.get<PaginatedShared>("/shared/", { params: { is_active: is_active ?? true } });
    });

export const createCatalogFn = createServerFn({ method: "POST" })
    .inputValidator(SharedFormValuesSchema)
    .handler(async ({ data }) => {
        return await api.post<Shared>("/shared/", data);
    });

export const updateCatalogFn = createServerFn({ method: "POST" })
    .inputValidator(SharedUpdateSchema)
    .handler(async ({ data }) => {
        return await api.patch<Shared>(`/shared/${data.id}`, data.data);
    });

export const deleteCatalogFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Shared>(`/shared/${id}`);
    });

export const addProductToCatalogFn = createServerFn({ method: "POST" })
    .inputValidator(AddRemoveProductSchema)
    .handler(async ({ data }) => {
        return await api.post<{ message: string }>(`/shared/${data.collectionId}/add-product/${data.productId}`);
    });

export const removeProductFromCatalogFn = createServerFn({ method: "POST" })
    .inputValidator(AddRemoveProductSchema)
    .handler(async ({ data }) => {
        return await api.delete<{ message: string }>(`/shared/${data.collectionId}/remove-product/${data.productId}`);
    });

export const bulkAddProductsToCatalogFn = createServerFn({ method: "POST" })
    .inputValidator(BulkAddProductsSchema)
    .handler(async ({ data }) => {
        return await api.post<{ message: string }>(`/shared/${data.collectionId}/add-products`, { product_ids: data.productIds });
    });
