import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Message, SearchImageItem } from "@/schemas";

export const useImageGalleryInfinite = (pageSize: number = 24) => {
    return useInfiniteQuery({
        queryKey: ["products", "gallery"],
        queryFn: async ({ pageParam = 0 }) =>
            await api.get<{ images: SearchImageItem[]; skip: number; limit: number; total_count: number; total_pages: number }>("/gallery/", {
                params: { skip: pageParam || 0, limit: pageSize },
            }),
        getNextPageParam: (lastPage) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < lastPage.total_count;

            return hasMore ? nextSkip : undefined;
        },
        initialPageParam: 0,
    });
};

export const useCreateImageMetadata = () => {
    return useMutation({
        mutationFn: async ({ imageId, input }: { imageId: number; input: any }) => await api.post<Message>(`/gallery/${imageId}/metadata`, input),
        onSuccess: () => {
            toast.success("Image metadata created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create image metadata");
        },
    });
};

export const useUpdateImageMetadata = () => {
    return useMutation({
        mutationFn: async ({ imageId, input }: { imageId: number; input: any }) => await api.patch<Message>(`/gallery/${imageId}/metadata`, input),
        onSuccess: () => {
            toast.success("Image metadata updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update image metadata");
        },
    });
};

export const useReIndexGallery = () => {
    return useMutation({
        mutationFn: async () => await api.post<Message>(`/gallery/reindex`),
        onSuccess: () => {
            toast.success("Gallery re-indexed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to re-index gallery");
        },
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => await api.patch<Message>(`/product/${id}/image`, data),
        onSuccess: () => {
            toast.success("Image uploaded successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to upload image");
        },
    });
};

export const useDeleteGalleryImage = () => {
    return useMutation({
        mutationFn: async ({ id }: { id: number }) => await api.delete<Message>(`/gallery/${id}`),
        onSuccess: () => {
            toast.success("Image deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};

export const useBulkDeleteGalleryImages = () => {
    return useMutation({
        mutationFn: async ({ imageIds }: { imageIds: number[] }) => await api.post<Message>(`/gallery/bulk-delete`, { files: imageIds }),
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk delete");
        },
    });
};

export const useBulkProductUpdate = () => {
    return useMutation({
        mutationFn: async ({ imageIds, input }: { imageIds: number[]; input: any }) =>
            await api.patch<Message>("/gallery/bulk-update", { image_ids: imageIds, data: input }),
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk metadata");
        },
    });
};

export const useBulkUploadImages = () => {
    return useMutation({
        mutationFn: async ({ urls }: { urls: string[] }) => await api.post<Message>("/gallery/bulk-upload", { urls }),
        onSuccess: () => {
            toast.success("Bulk image URLs saved successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save bulk image URLs");
        },
    });
};
