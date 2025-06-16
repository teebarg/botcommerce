import { api } from "./base";
import { CarouselBanner } from "@/schemas/carousel";

export const adminApi = {
    carousel: {
        list: () => api.get<CarouselBanner[]>("/carousel"),
        get: (id: number) => api.get<CarouselBanner>(`/carousel/${id}`),
        create: (data: Partial<CarouselBanner>) => api.post<CarouselBanner>("/carousel", data),
        update: (id: number, data: Partial<CarouselBanner>) => api.put<CarouselBanner>(`/carousel/${id}`, data),
        delete: (id: number) => api.delete(`/carousel/${id}`),
    },
    // ... existing code ...
}; 