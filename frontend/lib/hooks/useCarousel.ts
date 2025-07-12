import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { api as api2 } from "@/apis/client2";
import { CarouselBanner, ImageUpload, Message } from "@/schemas";

export const useCarouselBanners = () => {
    return useQuery({
        queryKey: ["carousel-banners"],
        queryFn: async () => await api.get<CarouselBanner[]>("/carousel/"),
    });
};

export const useCarouselBanner = (id: number) => {
    return useQuery({
        queryKey: ["carousel-banners", id],
        queryFn: async () => await api.get<CarouselBanner>(`/carousel/${id}`),
    });
};

export const useCarouselBannerActive = () => {
    return useQuery({
        queryKey: ["carousel-banners", "active"],
        queryFn: async () => await api.get<CarouselBanner[]>(`/carousel/active`),
    });
};

export const useCreateCarouselBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<CarouselBanner>) => await api.post<CarouselBanner>("/carousel", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carousel-banners"] });
            toast.success("Banner created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create banner");
        },
    });
};

export const useUpdateCarouselBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CarouselBanner> }) => await api.put<CarouselBanner>(`/carousel/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carousel-banners"] });
            toast.success("Banner updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update banner");
        },
    });
};

export const useDeleteCarouselBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/carousel/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carousel-banners"] });
            toast.success("Banner deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete banner");
        },
    });
};

export const useUploadCarouselImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ImageUpload }) => await api2.patch<CarouselBanner>(`/carousel/${id}/image`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carousel-banners"] });
            toast.success("Image uploaded");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to upload image");
        },
    });
};

export const useDeleteCarouselImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/carousel/${id}/image`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["carousel-banners"] });
            toast.success("Image deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};
