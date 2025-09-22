import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { api } from "@/apis/client";
import { Collection, DBCatalog, PaginatedShared, Shared } from "@/schemas";
import { CollectionFormValues } from "@/components/admin/collections/collection-form";
import { SharedFormValues } from "@/components/admin/shared-collections/shared-form";

export const useCollections = (query?: string) => {
    return useQuery({
        queryKey: ["collections", query],
        queryFn: async () => await api.get<Collection[]>("/collection/", { params: { query: query || "" } }),
    });
};

export const useCreateCollection = () => {
    return useMutation({
        mutationFn: async (data: CollectionFormValues) =>
            await api.post<Collection>("/collection/", {
                ...data,
            }),
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

export const useSharedCollections = (query?: string, is_active?: boolean) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ["catalog", query, is_active],
        queryFn: async () => await api.get<PaginatedShared>("/shared/", { params: { query: query || "", is_active: is_active } }),
        enabled: Boolean(session?.user?.isAdmin),
    });
};

export const useAllSharedCollections = () => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ["catalog"],
        queryFn: async () => await api.get<DBCatalog[]>("/shared/all"),
        enabled: Boolean(session?.user?.isAdmin),
    });
};

export const useCreateSharedCollection = () => {
    return useMutation({
        mutationFn: async (data: SharedFormValues) =>
            await api.post<Shared>("/shared/", {
                ...data,
            }),
        onSuccess: () => {
            toast.success("Shared collection created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create shared collection" + error);
        },
    });
};

export const useUpdateSharedCollection = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: SharedFormValues }) => await api.patch<Shared>(`/shared/${id}`, data),
        onSuccess: () => {
            toast.success("Shared collection updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update shared collection: " + error);
        },
    });
};

export const useDeleteSharedCollection = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<Shared>(`/shared/${id}`),
        onSuccess: () => {
            toast.success("Shared collection deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete shared collection" + error);
        },
    });
};

export const useAddProductToSharedCollection = () => {
    return useMutation({
        mutationFn: async ({ collectionId, productId }: { collectionId: number; productId: number }) =>
            await api.post<{ message: string }>(`/shared/${collectionId}/add-product/${productId}`),
        onSuccess: () => {
            toast.success("Product added to collection successfully");
        },
        onError: (error) => {
            toast.error("Failed to add product to collection: " + error);
        },
    });
};

export const useRemoveProductFromSharedCollection = () => {
    return useMutation({
        mutationFn: async ({ collectionId, productId }: { collectionId: number; productId: number }) =>
            await api.delete<{ message: string }>(`/shared/${collectionId}/remove-product/${productId}`),
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
            await api.post<{ message: string }>(`/shared/${collectionId}/add-products`, { product_ids: productIds }),
        onError: (error) => {
            toast.error("Failed to add products to catalog: " + error);
        },
    });
};
