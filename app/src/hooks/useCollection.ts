import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CollectionFormValues } from "@/components/admin/collections/collection-form";
import type { CatalogFormValues } from "@/components/admin/catalogs/catalog-form";
import { clientApi } from "@/utils/api.client";
import { Catalog, Collection, Message, PaginatedCatalog } from "@/schemas";

export const collectionsQuery = (params?: { search?: string }) =>
    queryOptions({
        queryKey: ["collections", params?.search],
        queryFn: () => clientApi.get<Collection[]>("/collection/", { params }),
        staleTime: Infinity,
    });

export const useCollections = () => {
    return useQuery({
        queryKey: ["collections"],
        queryFn: () => clientApi.get<Collection[]>(`/collection/`),
    });
};

export const useCreateCollection = () => {
    return useMutation({
        mutationFn: async (data: CollectionFormValues) => await clientApi.post<Collection>("/collection/", data),
        onSuccess: () => {
            toast.success("Collection created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create collection" + error);
        },
    });
};

export const useUpdateCollection = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: CollectionFormValues }) => await clientApi.patch<Collection>(`/collection/${id}`, data),
        onSuccess: () => {
            toast.success("Collection updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update collection" + error);
        },
    });
};

export const useDeleteCollection = () => {
    return useMutation({
        mutationFn: async (id: number) => await clientApi.delete<Collection>(`/collection/${id}`),
        onSuccess: () => {
            toast.success("Collection deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete collection" + error);
        },
    });
};

export const catalogsQuery = () =>
    queryOptions({
        queryKey: ["catalogs"],
        queryFn: () => clientApi.get<PaginatedCatalog>("/catalog/"),
        staleTime: Infinity,
    });

export const useCatalogs = () => {
    return useQuery(catalogsQuery());
};

export const useCreateCatalog = () => {
    return useMutation({
        mutationFn: async (data: CatalogFormValues) => await clientApi.post<Catalog>("/catalog/", data),
        onSuccess: () => {
            toast.success("catalog created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create catalog" + error);
        },
    });
};

export const useUpdateCatalog = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: CatalogFormValues }) => await clientApi.patch<Catalog>(`/catalog/${id}`, data),
        onSuccess: () => {
            toast.success("catalog updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to catalog: " + error);
        },
    });
};

export const useDeleteCatalog = () => {
    return useMutation({
        mutationFn: async (id: number) => clientApi.delete<Message>(`/catalog/${id}`),
        onSuccess: () => {
            toast.success("catalog deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete catalog" + error);
        },
    });
};

export const useAddProductToCatalog = () => {
    return useMutation({
        mutationFn: async ({ catalogId, productId }: { catalogId: number; productId: number }) =>
            await clientApi.post<{ message: string }>(`/catalog/${catalogId}/add-product/${productId}`),
        onSuccess: () => {
            toast.success("Product added to catalog successfully");
        },
        onError: (error) => {
            toast.error("Failed to add product to catalog: " + error);
        },
    });
};

export const useRemoveProductFromCatalog = () => {
    return useMutation({
        mutationFn: async ({ catalogId, productId }: { catalogId: number; productId: number }) =>
            await clientApi.delete<{ message: string }>(`/catalog/${catalogId}/remove-product/${productId}`),
        onSuccess: () => {
            toast.success("Product removed from catalog successfully");
        },
        onError: (error) => {
            toast.error("Failed to remove product from catalog: " + error);
        },
    });
};

export const useBulkAddProductsToCatalog = () => {
    return useMutation({
        mutationFn: async ({ catalogId, productIds }: { catalogId: number; productIds: number[] }) =>
            await clientApi.post<{ message: string }>(`/catalog/${catalogId}/add-products`, { product_ids: productIds }),
        onError: (error) => {
            toast.error("Failed to add products to catalog: " + error);
        },
    });
};
