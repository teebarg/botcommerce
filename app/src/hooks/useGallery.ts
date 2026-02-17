import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientApi } from "@/utils/api.client";
import { Message } from "@/schemas";

type ImageMetadataInput = { imageId: number; input: any };
type BulkUpdateInput = { imageIds: number[]; input: any };
type BulkUploadInput = { urls: string[] };

export const useCreateImageMetadata = () => {
    return useMutation({
        mutationFn: async ({ imageId, input }: ImageMetadataInput) => await clientApi.post<Message>(`/gallery/${imageId}/metadata`, input),
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
        mutationFn: async ({ imageId, input }: ImageMetadataInput) => await clientApi.patch<Message>(`/gallery/${imageId}/metadata`, input),
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
        mutationFn: async () => await clientApi.post<Message>("/gallery/reindex"),
        onSuccess: () => {
            toast.success("Gallery re-indexed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to re-index gallery");
        },
    });
};

export const useDeleteGalleryImage = () => {
    return useMutation({
        mutationFn: async ({ id }: { id: number }) => await clientApi.delete<Message>(`/gallery/${id}`),
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
        mutationFn: async ({ imageIds }: { imageIds: number[] }) => await clientApi.post<Message>(`/gallery/bulk-delete`, { files: imageIds }),
        onSuccess: () => {
            toast.success("Bulk delete successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk delete");
        },
    });
};

export const useBulkProductUpdate = () => {
    return useMutation({
        mutationFn: async ({ imageIds, input }: BulkUpdateInput) =>
            await clientApi.patch<Message>("/gallery/bulk-update", { image_ids: imageIds, data: input }),
        onSuccess: () => {
            toast.success("Bulk metadata updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk metadata");
        },
    });
};

export const useBulkUploadImages = () => {
    return useMutation({
        mutationFn: async (payload: BulkUploadInput) => await clientApi.post<Message>("/gallery/bulk-upload", { urls: payload.urls }),
        onSuccess: () => {
            toast.success("Bulk image URLs saved successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save bulk image URLs");
        },
    });
};
