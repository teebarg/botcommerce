import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Product, PaginatedProductSearch, Message, Review, PaginatedReview, ProductVariant, PaginatedProduct } from "@/schemas";

type SearchParams = {
    search?: string;
    categories?: string;
    collections?: string;
    min_price?: number | string;
    max_price?: number | string;
    page?: number;
    limit?: number;
    sort?: string;
};

interface ProductParams {
    query?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export const useProducts = (searchParams: ProductParams) => {
    return useQuery({
        queryKey: ["products", JSON.stringify(searchParams)],
        queryFn: async () => await api.get<PaginatedProduct>(`/product/`, { params: { ...searchParams } }),
    });
};

export const useProductSearch = (params: SearchParams) => {
    return useQuery({
        queryKey: ["products", "search", JSON.stringify(params)],
        queryFn: async () => await api.get<PaginatedProductSearch>("/product/search", { params }),
    });
};

export const useProduct = (slug: string) => {
    return useQuery({
        queryKey: ["product", slug],
        queryFn: async () => await api.get<Product>(`/product/${slug}`),
        enabled: !!slug,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: any) => await api.post<Product>("/product", input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create product");
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.put<Product>(`/product/${id}`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update product");
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/product/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete product");
        },
    });
};

export const useProductReviews = (productId: number) => {
    return useQuery({
        queryKey: ["product-reviews", productId],
        queryFn: async () => await api.get<Review[]>(`/product/${productId}/reviews`),
        enabled: !!productId,
    });
};

export const useProductReviewsSearch = (product_id: number, page = 1, limit = 20) => {
    return useQuery({
        queryKey: ["product-reviews", "search", product_id, page, limit],
        queryFn: async () => await api.get<PaginatedReview>(`/reviews/`, { params: { product_id, page, limit } }),
        enabled: !!product_id,
    });
};

export const useCreateVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            productId: number;
            sku?: string;
            price: number;
            old_price?: number;
            inventory: number;
            status: "IN_STOCK" | "OUT_OF_STOCK";
            size?: string;
            color?: string;
        }) => {
            const { productId, ...variantData } = input;

            return await api.post<ProductVariant>(`/product/${productId}/variants`, variantData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Variant created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create variant");
        },
    });
};

export const useUpdateVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            id: number;
            price?: number;
            old_price?: number;
            inventory?: number;
            status?: "IN_STOCK" | "OUT_OF_STOCK";
            size?: string;
            color?: string;
        }) => {
            const { id, ...variantData } = input;

            return await api.put<ProductVariant>(`/product/variants/${id}`, variantData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Variant updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update variant");
        },
    });
};

export const useDeleteVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/product/variants/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Variant deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete variant");
        },
    });
};

export const useExportProducts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post<Message>(`/product/export`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Products exported successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to export products");
        },
    });
};

export const useReIndexProducts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await api.post<Message>(`/product/reindex`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Products re-indexed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to re-index products");
        },
    });
};

export const useUploadImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => await api.patch<Message>(`/product/${id}/image`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Image uploaded successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to upload image");
        },
    });
};

export const useUploadImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => await api.post<Message>(`/product/${id}/images`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Images uploaded successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to upload images");
        },
    });
};

export const useDeleteImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: number }) => await api.delete<Message>(`/product/${id}/image`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Image deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};

export const useDeleteImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, imageId }: { id: number; imageId: number }) => await api.delete<Message>(`/product/${id}/images/${imageId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Image deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};

export const useReorderImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, imageIds }: { id: number; imageIds: number[] }) =>
            await api.patch<Message>(`/product/${id}/images/reorder`, imageIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Images reordered successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reorder images");
        },
    });
};
