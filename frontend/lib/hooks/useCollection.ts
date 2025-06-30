import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useInvalidate } from "./useApi";

import { api } from "@/apis/client";
import { Collection, PaginatedCollection } from "@/schemas";
import { CollectionFormValues } from "@/components/admin/collections/collection-form";

interface SearchParams {
    search?: string;
    page?: number;
    limit?: number;
}

export const useCollections = (searchParams: SearchParams) => {
    return useQuery({
        queryKey: ["collections", JSON.stringify(searchParams)],
        queryFn: async () => await api.get<PaginatedCollection>("/collection/", { params: { ...searchParams } }),
    });
};

export const useCollectionsAll = (search?: string) => {
    return useQuery({
        queryKey: ["collections", "all", search],
        queryFn: async () => await api.get<Collection[]>("/collection/all", { params: { search: search || "" } }),
    });
};

export const useCreateCollection = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (data: CollectionFormValues) =>
            await api.post<Collection>("/collection/", {
                ...data,
            }),
        onSuccess: () => {
            invalidate("collections");
            toast.success("Collection created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create collection" + error);
        },
    });
};

export const useUpdateCollection = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: CollectionFormValues }) => await api.patch<Collection>(`/collection/${id}`, data),
        onSuccess: () => {
            invalidate("collections");
            toast.success("Collection updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update collection" + error);
        },
    });
};

export const useDeleteCollection = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Collection>(`/collection/${id}`),
        onSuccess: () => {
            invalidate("collections");
            toast.success("Collection deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete collection" + error);
        },
    });
};
