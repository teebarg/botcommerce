import { useQuery, useMutation, queryOptions, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Message, PaginatedProductSearch, ProductVariant } from "@/schemas";
import { api } from "@/utils/api";
import { getCategoriesProductsFn, getIndexProductsFn } from "@/server/product.server";

type SearchParams = {
    search?: string;
    collections?: string;
    limit?: number;
};

export const useProductSearch = (params: SearchParams, enabled: boolean = false) => {
    return useQuery({
        queryKey: ["products", "search", params],
        queryFn: async () => await api.get<PaginatedProductSearch>("/product/", { params }),
        placeholderData: keepPreviousData,
        enabled,
    });
};

export const indexProductsQuery = () =>
    queryOptions({
        queryKey: ["products", "collections"],
        queryFn: () => getIndexProductsFn(),
    });

export const categoriesProductsQuery = () =>
    queryOptions({
        queryKey: ["products", "home"],
        queryFn: () => getCategoriesProductsFn(),
    });

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
