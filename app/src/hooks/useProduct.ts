import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/utils/fetch-api";
import { PaginatedProductSearch } from "@/schemas";
import {
    bustCacheFn,
    createProductFn,
    createVariantFn,
    deleteImagesFn,
    deleteProductFn,
    deleteVariantFn,
    flushCacheFn,
    getProductsFn,
    productSearchFn,
    recommendedProductsFn,
    reIndexProductsFn,
    reorderImagesFn,
    similarProductsFn,
    updateProductFn,
    updateVariantFn,
    uploadImageFn,
    uploadImagesFn,
} from "@/server/product.server";

// Type definitions matching the Server Function inputs
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

type UpdateProductInput = { id: number; input: any };
type CreateVariantInput = {
    productId: number;
    sku?: string;
    price: number;
    old_price?: number;
    inventory: number;
    size?: string;
    color?: string;
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
        queryFn: () => productSearchFn({ data: params }),
    });
};

export const useProductInfiniteSearch = (initialData: PaginatedProductSearch, search?: SearchParams) => {
    return useInfiniteQuery({
        queryKey: ["products", "search", "infinite", JSON.stringify(search)],
        queryFn: ({ pageParam = 0 }) => getProductsFn({ data: { skip: pageParam, limit: 24, ...search } }),
        getNextPageParam: (lastPage) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < lastPage.total_count;

            return hasMore ? nextSkip : undefined;
        },
        initialPageParam: 0,
        initialData: initialData
            ? {
                  pages: [
                      {
                          ...initialData,
                      },
                  ],
                  pageParams: [0],
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

export const useCreateProduct = () => {
    return useMutation({
        mutationFn: async (input: any) => await createProductFn({ data: input }),
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
        mutationFn: async ({ id, input }: UpdateProductInput) => await updateProductFn({ data: { id, input } }),
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
        mutationFn: async (id: number) => await deleteProductFn({ data: id }),
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
        mutationFn: async (input: CreateVariantInput) => await createVariantFn({ data: input }),
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
        mutationFn: async (input: UpdateVariantInput) => await updateVariantFn({ data: input }),
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
        mutationFn: async (id: number) => await deleteVariantFn({ data: id }),
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
        mutationFn: async () => await reIndexProductsFn({}),
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
        mutationFn: async ({ id, data }: UploadImageInput) => await uploadImageFn({ data: { id, data } }),
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
        mutationFn: async ({ id, data }: UploadImageInput) => await uploadImagesFn({ data: { id, data } }),
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
        mutationFn: async ({ id, imageId }: DeleteImageInput) => await deleteImagesFn({ data: { id, imageId } }),
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
        mutationFn: async ({ id, imageIds }: ReorderImagesInput) => await reorderImagesFn({ data: { id, imageIds } }),
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
        mutationFn: async () => await bustCacheFn({}),
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
        mutationFn: async () => await flushCacheFn({}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Cache cleared successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to clear cache");
        },
    });
};
