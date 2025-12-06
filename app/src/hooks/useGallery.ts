import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    bulkDeleteGalleryImagesFn,
    bulkProductUpdateFn,
    bulkUploadImagesFn,
    createImageMetadataFn,
    deleteGalleryImageFn,
    getGalleryImagesFn,
    reIndexGalleryFn,
    updateImageMetadataFn,
} from "@/server/gallery.server";
import { Catalog, GalleryImage, GalleryImageItem } from "@/schemas";

type ImageMetadataInput = { imageId: number; input: any };
type BulkDeleteInput = { imageIds: number[] };
type BulkUpdateInput = { imageIds: number[]; input: any };
type BulkUploadInput = { urls: string[] };

interface PaginatedGalleryResponse {
    images: GalleryImageItem[];
    next_cursor: number | null;
}

export const useImageGalleryInfinite = (pageSize: number = 20, initial: PaginatedGalleryResponse) => {
    return useInfiniteQuery({
        queryKey: ["gallery"],
        queryFn: ({ pageParam = 0 }) => getGalleryImagesFn({ data: { cursor: pageParam, limit: pageSize } }),
        getNextPageParam: (lastPage) => lastPage.next_cursor,
        initialPageParam: null as number | null,
        initialData: { pages: [initial], pageParams: [0] },
    });
};

export const useCreateImageMetadata = () => {
    return useMutation({
        mutationFn: async (payload: ImageMetadataInput) => await createImageMetadataFn({ data: payload }),
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
        mutationFn: async (payload: ImageMetadataInput) => await updateImageMetadataFn({ data: payload }),
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
        mutationFn: async () => await reIndexGalleryFn({}),
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
        mutationFn: async ({ id }: { id: number }) => await deleteGalleryImageFn({ data: { id } }),
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
        mutationFn: async ({ imageIds }: { imageIds: number[] }) => await bulkDeleteGalleryImagesFn({ data: { imageIds } }),
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
        mutationFn: async (payload: BulkUpdateInput) => await bulkProductUpdateFn({ data: payload }),
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
        mutationFn: async (payload: BulkUploadInput) => await bulkUploadImagesFn({ data: payload }),
        onSuccess: () => {
            toast.success("Bulk image URLs saved successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save bulk image URLs");
        },
    });
};
