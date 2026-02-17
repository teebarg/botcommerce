import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/fetch-api";
import type { GalleryImageItem } from "@/schemas";

interface PaginatedGalleryResponse {
    images: GalleryImageItem[];
    next_cursor: number | null;
}

export const getGalleryImagesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<PaginatedGalleryResponse>("/gallery/");
});
