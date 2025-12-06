import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/utils/fetch-api";
import type { GalleryImageItem, Message } from "@/schemas";

// --- Type Definitions for API Response Schemas ---

interface PaginatedGalleryResponse {
    images: GalleryImageItem[];
    next_cursor: number | null;
}

// Schema for parameters used in useImageGalleryInfinite
const GetGalleryParamsSchema = z.object({
    cursor: z.number().nullable().optional(),
    limit: z.number().default(20),
});

const ImageMetadataPayloadSchema = z.object({
    imageId: z.number(),
    // 'input' is typed as 'any' in the original code, so we use z.unknown()
    input: z.unknown(),
});

const DeleteGalleryImageSchema = z.object({
    id: z.number(),
});

const BulkDeleteSchema = z.object({
    imageIds: z.array(z.number()),
});

const BulkProductUpdateSchema = z.object({
    imageIds: z.array(z.number()),
    // 'input' is typed as 'any' in the original code
    input: z.unknown(),
});

const BulkUploadSchema = z.object({
    urls: z.array(z.string().url()),
});

// --- Server Functions ---
export const getGalleryImagesFn = createServerFn({ method: "GET" })
    .inputValidator(GetGalleryParamsSchema.partial())
    .handler(async ({ data }) => {
        // Map client-side camelCase to server-side params
        const params = {
            cursor: data?.cursor,
            limit: data?.limit,
        };
        return await api.get<PaginatedGalleryResponse>("/gallery/", { params });
    });

export const createImageMetadataFn = createServerFn({ method: "POST" })
    .inputValidator(ImageMetadataPayloadSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>(`/gallery/${data.imageId}/metadata`, data.input);
    });

export const updateImageMetadataFn = createServerFn({ method: "POST" })
    .inputValidator(ImageMetadataPayloadSchema)
    .handler(async ({ data }) => {
        return await api.patch<Message>(`/gallery/${data.imageId}/metadata`, data.input);
    });

export const reIndexGalleryFn = createServerFn({ method: "POST" }).handler(async () => {
    return await api.post<Message>(`/gallery/reindex`);
});

export const deleteGalleryImageFn = createServerFn({ method: "POST" })
    .inputValidator(DeleteGalleryImageSchema)
    .handler(async ({ data }) => {
        return await api.delete<Message>(`/gallery/${data.id}`);
    });

export const bulkDeleteGalleryImagesFn = createServerFn({ method: "POST" })
    .inputValidator(BulkDeleteSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>(`/gallery/bulk-delete`, { files: data.imageIds });
    });

export const bulkProductUpdateFn = createServerFn({ method: "POST" })
    .inputValidator(BulkProductUpdateSchema)
    .handler(async ({ data }) => {
        return await api.patch<Message>("/gallery/bulk-update", { image_ids: data.imageIds, data: data.input });
    });

export const bulkUploadImagesFn = createServerFn({ method: "POST" })
    .inputValidator(BulkUploadSchema)
    .handler(async ({ data }) => {
        return await api.post<Message>("/gallery/bulk-upload", { urls: data.urls });
    });
