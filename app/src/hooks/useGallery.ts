import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Message } from "@/schemas";
import { api } from "@/utils/api";

type ImageMetadataInput = { imageId: number; input: any };
type BulkUpdateInput = { imageIds: number[]; input: any };
type BulkUploadInput = { urls: string[] };

export const useCreateImageMetadata = () => {
    return useMutation({
        mutationFn: async ({ imageId, input }: ImageMetadataInput) => await api.post<Message>(`/gallery/${imageId}/metadata`, input),
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
        mutationFn: async ({ imageId, input }: ImageMetadataInput) => await api.patch<Message>(`/gallery/${imageId}/metadata`, input),
        onSuccess: () => {
            toast.success("Image metadata updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update image metadata");
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
        mutationFn: async ({ imageIds, input }: BulkUpdateInput) =>
            await api.patch<Message>("/gallery/bulk-update", { image_ids: imageIds, data: input }),
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk metadata");
        },
    });
};

export const useBulkUploadImages = () => {
    return useMutation({
        mutationFn: async (payload: BulkUploadInput) => await api.post<Message>("/gallery/bulk-upload", { urls: payload.urls }),
        onSuccess: () => {
            toast.success("Bulk image URLs saved successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save bulk image URLs");
        },
    });
};
