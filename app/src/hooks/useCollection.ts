import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CollectionFormValues } from "@/components/admin/collections/collection-form";
import type { CatalogFormValues } from "@/components/admin/catalogs/catalog-form";
import { createCollectionFn, deleteCollectionFn, getCollectionsFn, updateCollectionFn } from "@/server/collections.server";
import { useRouteContext } from "@tanstack/react-router";
import { clientApi } from "@/utils/api.client";
import { Catalog, Message, PaginatedCatalog } from "@/schemas";

export const collectionsQuery = (query?: string) =>
    queryOptions({
        queryKey: ["collections", query],
        staleTime: 1000 * 60 * 60, // 1 hour
        queryFn: () => getCollectionsFn({ data: query }),
    });

export const useCollections = (query?: string) => useQuery(collectionsQuery(query));

export const useCreateCollection = () => {
    return useMutation({
        mutationFn: async (data: CollectionFormValues) => await createCollectionFn({ data }),
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
        mutationFn: async ({ id, data }: { id: number; data: CollectionFormValues }) => await updateCollectionFn({ data: { id, data } }),
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
        mutationFn: async (id: number) => await deleteCollectionFn({ data: id }),
        onSuccess: () => {
            toast.success("Collection deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete collection" + error);
        },
    });
};

export const useCatalogs = (is_active?: boolean) => {
    const { session } = useRouteContext({ strict: false });

    return useQuery({
        queryKey: ["catalog", is_active],
        queryFn: () => clientApi.get<PaginatedCatalog>("/catalog/", { params: { is_active: is_active ?? null } }),
        enabled: Boolean(session?.user?.isAdmin),
    });
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
