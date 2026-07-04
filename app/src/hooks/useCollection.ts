import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CollectionFormValues } from "@/components/admin/collections/collection-form";
import type { CatalogFormValues } from "@/components/admin/catalogs/catalog-form";
import { Catalog, Collection, Message, PaginatedCatalog } from "@/schemas";
import { api } from "@/utils/api";

export const useCollections = (params?: { search?: string }) => {
    return useQuery({
        queryKey: ["collections", params?.search ?? "all"],
        queryFn: () => api.get<Collection[]>("/collection/", { params }),
        staleTime: Infinity,
    });
};

export const useCreateCollection = () => {
    return useMutation({
        mutationFn: async (data: CollectionFormValues) => await api.post<Collection>("/collection/", data),
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
        mutationFn: async ({ id, data }: { id: number; data: CollectionFormValues }) => await api.patch<Collection>(`/collection/${id}`, data),
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
        mutationFn: async (id: number) => await api.delete<Collection>(`/collection/${id}`),
        onSuccess: () => {
            toast.success("Collection deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete collection" + error);
        },
    });
};

export const useCatalogs = () => {
    return useQuery({
        queryKey: ["catalogs"],
        queryFn: () => api.get<PaginatedCatalog>("/catalog/"),
    });
};

export const useCreateCatalog = () => {
    return useMutation({
        mutationFn: async (data: CatalogFormValues) => await api.post<Catalog>("/catalog/", data),
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
        mutationFn: async ({ id, data }: { id: number; data: CatalogFormValues }) => await api.patch<Catalog>(`/catalog/${id}`, data),
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
        mutationFn: async (id: number) => api.delete<Message>(`/catalog/${id}`),
        onSuccess: () => {
            toast.success("catalog deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete catalog" + error);
        },
    });
};

export const useBulkAddProductsToCatalog = () => {
    return useMutation({
        mutationFn: async ({ catalogId, productIds }: { catalogId: number; productIds: number[] }) =>
            await api.post<{ message: string }>(`/catalog/${catalogId}/add-products`, { product_ids: productIds }),
        onError: (error) => {
            toast.error("Failed to add products to catalog: " + error);
        },
    });
};
