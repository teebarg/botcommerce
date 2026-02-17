import { useQuery, useMutation, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Message, PaginatedProductSearch, ProductFeed, ProductVariant } from "@/schemas";
import { recommendedProductsFn, similarProductsFn } from "@/server/product.server";
import { useRef } from "react";
import { clientApi } from "@/utils/api.client";

type SearchParams = {
    search?: string;
    categories?: string;
    collections?: string;
    min_price?: number;
    max_price?: number;
    skip?: number;
    limit?: number;
    sort?: string;
    show_facets?: boolean;
    show_suggestions?: boolean;
};

type FeedParams = {
    search?: string;
    categories?: string;
    collections?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    show_facets?: boolean;
};
type UpdateVariantInput = {
    id: number;
    price?: number;
    old_price?: number;
    inventory?: number;
    status?: "IN_STOCK" | "OUT_OF_STOCK";
    size?: string;
    color?: string;
    measurement?: number;
    age?: string;
};
type UploadImageInput = { id: number; data: any };
type DeleteImageInput = { id: number; imageId: number };
type ReorderImagesInput = { id: number; imageIds: number[] };

export const useProductSearch = (params: SearchParams) => {
    return useQuery({
        queryKey: ["products", "search", params],
        queryFn: async () => await clientApi.get<PaginatedProductSearch>("/product/", { params }),
    });
};

export const useProductFeed = (initialData: ProductFeed | null, search?: FeedParams) => {
    const feedSeedRef = useRef<number | null>(initialData?.feed_seed ?? null);
    return useInfiniteQuery<ProductFeed, Error, InfiniteData<ProductFeed>, [string, string, string, FeedParams | {}], string | null>({
        queryKey: ["products", "feed", `${feedSeedRef.current}` || "", search ?? {}],
        queryFn: async ({ pageParam }) => {
            const res = await clientApi.get<ProductFeed>("/product/feed", {
                params: { cursor: pageParam ?? undefined, feed_seed: feedSeedRef.current ?? undefined, ...search },
            });
            return res;
        },
        getNextPageParam: (lastPage) => {
            if (!feedSeedRef.current) {
                feedSeedRef.current = lastPage.feed_seed;
            }
            return lastPage.next_cursor ?? undefined;
        },

        initialPageParam: null,

        initialData: initialData
            ? {
                  pages: [initialData],
                  pageParams: [null],
              }
            : undefined,
    });
};

export const useRecommendedProducts = (limit: number = 20, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["products", "recommended", limit],
        queryFn: () => recommendedProductsFn({ data: { limit } }),
        enabled: enabled,
    });
};

export const useSimilarProducts = (productId: number, limit: number = 20) => {
    return useQuery({
        queryKey: ["products", "similar", productId, limit],
        queryFn: () => similarProductsFn({ data: { productId, limit } }),
        enabled: !!productId,
    });
};

export const useUpdateVariant = (showToast = true) => {
    return useMutation({
        mutationFn: async (input: UpdateVariantInput) => {
            const { id, ...variantData } = input;
            return await clientApi.put<ProductVariant>(`/product/variants/${id}`, variantData);
        },
        onSuccess: () => {
            showToast && toast.success("Variant updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update variant");
        },
    });
};

export const useReIndexProducts = () => {
    return useMutation({
        mutationFn: async () => await clientApi.post<Message>("/product/reindex"),
        onSuccess: () => {
            toast.success("Products re-indexed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to re-index products");
        },
    });
};

export const useUploadImages = () => {
    return useMutation({
        mutationFn: async ({ id, data }: UploadImageInput) => await clientApi.post<Message>(`/product/${id}/images`, data),
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
        mutationFn: async ({ id, imageId }: DeleteImageInput) => await clientApi.delete<Message>(`/product/${id}/images/${imageId}`),
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
        mutationFn: async ({ id, imageIds }: ReorderImagesInput) => await clientApi.patch<Message>(`/product/${id}/images/reorder`, imageIds),
        onSuccess: () => {
            toast.success("Images reordered successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reorder images");
        },
    });
};
