import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { api } from "@/apis/client";
import { Product, PaginatedProductSearch, Message, ProductVariant, ProductSearch } from "@/schemas";

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
        queryKey: ["products", "search", params],
        queryFn: async () => await api.get<PaginatedProductSearch>("/product/", { params }),
    });
};

export const useProductInfiniteSearch = (params: SearchParams) => {
    return useInfiniteQuery({
        queryKey: ["products", "search", "infinite", params],
        queryFn: async ({ pageParam = 0 }) =>
            await api.get<PaginatedProductSearch>("/product/", { params: { skip: pageParam, limit: 24, ...params } }),
        getNextPageParam: (lastPage: PaginatedProductSearch) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < lastPage.total_count;

            return hasMore ? nextSkip : undefined;
        },
        initialPageParam: 0,
    });
};

export const useRecommendedProducts = (limit: number = 20) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ["products", "recommended", limit],
        queryFn: async () => await api.get<{ recommended: ProductSearch[] }>("/product/recommend", { params: { limit } }),
        enabled: Boolean(session?.user),
    });
};

export const useSimilarProducts = (productId: number, limit: number = 20) => {
    return useQuery({
        queryKey: ["products", "similar", productId, limit],
        queryFn: async () => await api.get<{ similar: ProductSearch[] }>(`/product/${productId}/similar`, { params: { limit } }),
        enabled: !!productId,
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
            age?: string;
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
