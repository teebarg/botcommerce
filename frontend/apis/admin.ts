import { api } from "./base";

import { ImageUpload, Message, CarouselBanner } from "@/schemas";

export const adminApi = {
    carousel: {
        list: () => api.get<CarouselBanner[]>("/carousel/", { cache: "default" }),
        get: (id: number) => api.get<CarouselBanner>(`/carousel/${id}`),
        create: (data: Partial<CarouselBanner>) => api.post<CarouselBanner>("/carousel", data),
        update: (id: number, data: Partial<CarouselBanner>) => api.put<CarouselBanner>(`/carousel/${id}`, data),
        delete: (id: number) => api.delete(`/carousel/${id}`),
        uploadImage: (id: number, data: ImageUpload) => api.patch<CarouselBanner>(`/carousel/${id}/image`, data),
        deleteImage: (id: number) => api.delete<Message>(`/carousel/${id}/image`),
    },
    // ... existing code ...
};
