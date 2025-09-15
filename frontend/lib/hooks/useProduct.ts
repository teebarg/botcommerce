import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Product, PaginatedProductSearch, Message, ProductVariant, ProductImage } from "@/schemas";

type SearchParams = {
    search?: string;
    categories?: string;
    collections?: string;
    min_price?: number | string;
    max_price?: number | string;
    skip?: number;
    limit?: number;
    sort?: string;
    show_facets?: boolean;
    show_suggestions?: boolean;
};

export const useProductSearch = (params: SearchParams) => {
    return useQuery({
        queryKey: ["products", "search", JSON.stringify(params)],
        queryFn: async () => await api.get<PaginatedProductSearch>("/product/", { params }),
    });
};

export const useProductInfiniteSearch = (params: SearchParams) => {
    return useInfiniteQuery({
        queryKey: ["products", "search", "infinite", JSON.stringify(params)],
        queryFn: async ({ pageParam = 0 }) =>
            await api.get<PaginatedProductSearch>("/product/", { params: { skip: pageParam, limit: 12, ...params } }),
        getNextPageParam: (lastPage: PaginatedProductSearch) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < lastPage.total_count;

            return hasMore ? nextSkip : undefined;
        },
        initialPageParam: 0,
    });
};

export const useProduct = (slug: string) => {
    return useQuery({
        queryKey: ["product", slug],
        queryFn: async () => await api.get<Product>(`/product/${slug}`),
    });
};

export const useProductRecommendations = (userId?: number, num: number = 16) => {
    return useQuery({
        queryKey: ["products", "recommendations", userId],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_RECOMMENDATION_URL}/recommendations/${userId}?num=${num}`);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            return response.json();
        },
        enabled: !!userId,
    });
};

export const useSimilarProducts = (productId: number, num: number = 16) => {
    return useQuery({
        queryKey: ["products", "similar", productId],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_RECOMMENDATION_URL}/similar-products/${productId}?num=${num}`);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            return response.json();
        },
        enabled: !!productId,
    });
};

export const useImageGalleryInfinite = (pageSize: number = 24) => {
    return useInfiniteQuery({
        queryKey: ["products", "gallery", pageSize],
        queryFn: async ({ pageParam = 0 }) =>
            await api.get<{ images: ProductImage[]; skip: number; limit: number; total_count: number; total_pages: number }>("/product/gallery", {
                params: { skip: pageParam, limit: pageSize },
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
        mutationFn: async ({ imageId, input }: { imageId: number; input: any }) => await api.post<Message>(`/product/${imageId}/metadata`, input),
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
        mutationFn: async ({ imageId, input }: { imageId: number; input: any }) => await api.patch<Message>(`/product/${imageId}/metadata`, input),
        onSuccess: () => {
            toast.success("Image metadata updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update image metadata");
        },
    });
};

export const useCreateProduct = () => {
    return useMutation({
        mutationFn: async (input: any) => await api.post<Product>("/product", input),
        onSuccess: () => {
            toast.success("Product created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create product");
        },
    });
};

export const useUpdateProduct = () => {
    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.put<Product>(`/product/${id}`, input),
        onSuccess: () => {
            toast.success("Product updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update product");
        },
    });
};

export const useDeleteProduct = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/product/${id}`),
        onSuccess: () => {
            toast.success("Product deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete product");
        },
    });
};

export const useCreateVariant = () => {
    return useMutation({
        mutationFn: async (input: {
            productId: number;
            sku?: string;
            price: number;
            old_price?: number;
            inventory: number;
            size?: string;
            color?: string;
        }) => {
            const { productId, ...variantData } = input;

            return await api.post<ProductVariant>(`/product/${productId}/variants`, variantData);
        },
        onSuccess: () => {
            toast.success("Variant created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create variant");
        },
    });
};

export const useUpdateVariant = (showToast = true) => {
    return useMutation({
        mutationFn: async (input: {
            id: number;
            price?: number;
            old_price?: number;
            inventory?: number;
            status?: "IN_STOCK" | "OUT_OF_STOCK";
            size?: string;
            color?: string;
            measurement?: number;
        }) => {
            const { id, ...variantData } = input;

            return await api.put<ProductVariant>(`/product/variants/${id}`, variantData);
        },
        onSuccess: () => {
            showToast && toast.success("Variant updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update variant");
        },
    });
};

export const useDeleteVariant = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/product/variants/${id}`),
        onSuccess: () => {
            toast.success("Variant deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete variant");
        },
    });
};

export const useExportProducts = () => {
    return useMutation({
        mutationFn: async () => await api.post<Message>(`/product/export`, {}),
        onSuccess: () => {
            toast.success("Products exported successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to export products");
        },
    });
};

export const useReIndexProducts = () => {
    return useMutation({
        mutationFn: async () => await api.post<Message>(`/product/reindex`),
        onSuccess: () => {
            toast.success("Products re-indexed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to re-index products");
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

export const useUploadImages = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => await api.post<Message>(`/product/${id}/images`, data),
        onSuccess: () => {
            toast.success("Images uploaded successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to upload images");
        },
    });
};

export const useDeleteImage = () => {
    return useMutation({
        mutationFn: async ({ id }: { id: number }) => await api.delete<Message>(`/product/${id}/image`),
        onSuccess: () => {
            toast.success("Image deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};

export const useDeleteImages = () => {
    return useMutation({
        mutationFn: async ({ id, imageId }: { id: number; imageId: number }) => await api.delete<Message>(`/product/${id}/images/${imageId}`),
        onSuccess: () => {
            toast.success("Image deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};

export const useDeleteGalleryImage = () => {
    return useMutation({
        mutationFn: async ({ id }: { id: number }) => await api.delete<Message>(`/product/gallery/${id}`),
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
        mutationFn: async ({ imageIds }: { imageIds: number[] }) => await api.post<Message>(`/product/images/bulk-delete`, { files: imageIds }),
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk delete");
        },
    });
};

export const useBulkProductUpdate = () => {
    return useMutation({
        mutationFn: async ({ imageIds, input }: { imageIds: number[]; input: any }) =>
            await api.patch<Message>("/product/gallery/bulk-update", { image_ids: imageIds, data: input }),
        onSuccess: () => {
            toast.success("Bulk metadata started");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to start bulk metadata");
        },
    });
};

export const useBulkSaveImageUrls = () => {
    return useMutation({
        mutationFn: async ({ urls }: { urls: string[] }) => await api.post<Message>("/product/images/bulk-save-urls", { urls }),
        onSuccess: () => {
            toast.success("Bulk image URLs saved successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save bulk image URLs");
        },
    });
};

export const useReorderImages = () => {
    return useMutation({
        mutationFn: async ({ id, imageIds }: { id: number; imageIds: number[] }) =>
            await api.patch<Message>(`/product/${id}/images/reorder`, imageIds),
        onSuccess: () => {
            toast.success("Images reordered successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reorder images");
        },
    });
};

export const useBustCache = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post<Message>("/cache/bust", { pattern: "products" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Cache busted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to bust cache");
        },
    });
};

export const useFlushCache = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post<Message>("/cache/clear", {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Cache cleared successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to clear cache");
        },
    });
};
