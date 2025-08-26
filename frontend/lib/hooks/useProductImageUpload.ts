import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { ProductImageFile, ImageUploadResponse, BulkEditData } from "@/types/product-image";

export const useProductImageUpload = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (images: ProductImageFile[]): Promise<ImageUploadResponse> => {
            const formData = new FormData();

            images.forEach((image) => {
                formData.append("files", image.file);
                formData.append("metas", JSON.stringify(image.metadata));
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/product/images/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload images");
            }

            return response.json();
        },
        onSuccess: (data) => {
            toast.success(`Successfully uploaded ${data.images.length} images`);
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
        },
    });
};

export const useProductImageUploadWithProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (images: ProductImageFile[]): Promise<ImageUploadResponse> => {
            const results: ImageUploadResponse = {
                success: true,
                images: [],
                errors: [],
            };

            // Upload images one by one to track individual progress
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const formData = new FormData();
                formData.append("files", image.file);
                formData.append("metas", JSON.stringify(image.metadata));

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/product/images/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const first = result.images?.[0];
                        results.images.push({ id: image.id, url: first?.url, metadata: image.metadata });
                    } else {
                        results.errors?.push({
                            id: image.id,
                            error: "Upload failed",
                        });
                    }
                } catch (error) {
                    results.errors?.push({
                        id: image.id,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }

            return results;
        },
        onSuccess: (data) => {
            const successCount = data.images.length;
            const errorCount = data.errors?.length || 0;

            if (successCount > 0) {
                toast.success(`Successfully uploaded ${successCount} images`);
            }

            if (errorCount > 0) {
                toast.error(`${errorCount} images failed to upload`);
            }

            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
        },
    });
};

export const useBulkEditImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ imageIds, data }: { imageIds: string[]; data: BulkEditData }) => {
            return await api.patch("/product/images/bulk-edit", {
                image_ids: imageIds,
                ...data,
            });
        },
        onSuccess: () => {
            toast.success("Images updated successfully");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: Error) => {
            toast.error(`Update failed: ${error.message}`);
        },
    });
};
