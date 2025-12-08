import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CollectionFormValues } from "@/components/admin/collections/collection-form";
import { SharedFormValues } from "@/components/admin/shared-collections/shared-form";
import {
    addProductToCatalogFn,
    bulkAddProductsToCatalogFn,
    createCatalogFn,
    createCollectionFn,
    deleteCatalogFn,
    deleteCollectionFn,
    getCatalogsFn,
    getCollectionsFn,
    removeProductFromCatalogFn,
    updateCatalogFn,
    updateCollectionFn,
} from "@/server/collections.server";
import { useRouteContext } from "@tanstack/react-router";

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
        queryFn: () => getCatalogsFn({ data: is_active }),
        enabled: Boolean(session?.user?.isAdmin),
    });
};

export const useCreateCatalog = () => {
    return useMutation({
        mutationFn: async (data: SharedFormValues) => await createCatalogFn({ data }),
        onSuccess: () => {
            toast.success("Shared collection created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create shared collection" + error);
        },
    });
};

export const useUpdateCatalog = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: SharedFormValues }) => await updateCatalogFn({ data: { id, data } }),
        onSuccess: () => {
            toast.success("Shared collection updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update shared collection: " + error);
        },
    });
};

export const useDeleteCatalog = () => {
    return useMutation({
        mutationFn: async (id: number) => await deleteCatalogFn({ data: id }),
        onSuccess: () => {
            toast.success("Shared collection deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete shared collection" + error);
        },
    });
};

export const useAddProductToCatalog = () => {
    return useMutation({
        mutationFn: async ({ collectionId, productId }: { collectionId: number; productId: number }) =>
            await addProductToCatalogFn({ data: { collectionId, productId } }),
        onSuccess: () => {
            toast.success("Product added to collection successfully");
        },
        onError: (error) => {
            toast.error("Failed to add product to collection: " + error);
        },
    });
};

export const useRemoveProductFromCatalog = () => {
    return useMutation({
        mutationFn: async ({ collectionId, productId }: { collectionId: number; productId: number }) =>
            await removeProductFromCatalogFn({ data: { collectionId, productId } }),
        onSuccess: () => {
            toast.success("Product removed from collection successfully");
        },
        onError: (error) => {
            toast.error("Failed to remove product from collection: " + error);
        },
    });
};

export const useBulkAddProductsToCatalog = () => {
    return useMutation({
        mutationFn: async ({ collectionId, productIds }: { collectionId: number; productIds: number[] }) =>
            await bulkAddProductsToCatalogFn({ data: { collectionId, productIds } }),
        onError: (error) => {
            toast.error("Failed to add products to catalog: " + error);
        },
    });
};
