import { useQuery, useMutation, useInfiniteQuery, type InfiniteData, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FeedQuery, Message, PaginatedProductSearch, ProductFeed, ProductSearch, ProductVariant } from "@/schemas";
import { api } from "@/utils/api";


export const useProductFeed = (initialData: ProductFeed | null, search?: FeedQuery) => {
    return useInfiniteQuery<
        ProductFeed,
        Error,
        InfiniteData<ProductFeed>,
        [string, string, string, FeedQuery],
        string | null
    >({
        queryKey: ["products", "list", "infinite", search ?? {}],
        queryFn: async ({ pageParam }) => {
            const res = await api.get<ProductFeed>("/product/feed", {
                params: {
                    cursor: pageParam ?? undefined,
                    ...search
                },
            });
            return res;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.next_cursor ?? null;
        },
        initialPageParam: null,
        initialData: initialData
            ? {
                pages: [initialData],
                pageParams: [null],
            }
            : undefined,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });
};

type SearchParams = {
    search?: string;
    collections?: string;
    limit?: number;
};

export const useProductSearch = (
    params: SearchParams,
    options?: Omit<UseQueryOptions<PaginatedProductSearch, Error>, "queryKey" | "queryFn">
) => {
    return useQuery({
        queryKey: ["products", "search", params],
        queryFn: async () => await api.get<PaginatedProductSearch>("/product/", { params }),
        ...options,
    });
};

interface IndexProducts {
    arrival: ProductSearch[];
    featured: ProductSearch[];
    trending: ProductSearch[];
}

export const useIndexProducts = () => {
    return useQuery({
        queryKey: ["products", "collections"],
        queryFn: async () => await api.get<IndexProducts>("/product/index-products"),
        staleTime: 1000 * 60 * 60,
    });
};

type UpdateVariantInput = {
    id: number;
    price?: number;
    old_price?: number;
    inventory?: number;
    status?: "IN_STOCK" | "OUT_OF_STOCK";
    size?: string;
    color?: string;
    width?: number;
    length?: number;
    age?: string;
};

export const useUpdateVariant = (showToast = true) => {
    return useMutation({
        mutationFn: async (input: UpdateVariantInput) => {
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

export const useReIndexProducts = () => {
    return useMutation({
        mutationFn: async () => await api.post<Message>("/product/reindex"),
        onSuccess: () => {
            toast.success("Products re-indexing queued");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to re-index products");
        },
    });
};
