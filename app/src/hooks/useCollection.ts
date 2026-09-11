import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CollectionFormValues } from "@/components/admin/collections/collection-form";
import { Collection } from "@/schemas";
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
            toast.success("collection created");
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
            toast.success("collection updated");
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
            toast.success("collection deleted");
        },
        onError: (error) => {
            toast.error("Failed to delete collection" + error);
        },
    });
};
