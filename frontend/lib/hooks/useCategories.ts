import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useInvalidate } from "./useApi";

import { api } from "@/apis/client";
import { Category } from "@/schemas";
import { CategoryFormValues } from "@/components/admin/categories/category-form";

interface SearchParams {
    search?: string;
    page?: number;
    limit?: number;
}

export const useCategories = (query?: string) => {
    return useQuery({
        queryKey: ["categories", query],
        queryFn: async () => await api.get<Category[]>(`/category/`, { params: { query: query ?? "" } }),
    });
};

export const useCreateCategory = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (data: CategoryFormValues) =>
            await api.post<Category>("/category/", {
                ...data,
            }),
        onSuccess: () => {
            invalidate("categories");
            toast.success("Category created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create category" + error);
        },
    });
};

export const useUpdateCategory = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => await api.patch<Category>(`/category/${id}`, data),
        onSuccess: () => {
            invalidate("categories");
            toast.success("Category updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update category" + error);
        },
    });
};

export const useDeleteCategory = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Category>(`/category/${id}`),
        onSuccess: () => {
            invalidate("categories");
            toast.success("Category deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete category" + error);
        },
    });
};

export const useReorderCategories = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (data: { id: number; display_order: number }[]) => await api.patch<Category>(`/category/reorder`, { categories: data }),
        onSuccess: () => {
            invalidate("categories");
            toast.success("Category reordered successfully");
        },
        onError: (error) => {
            toast.error("Failed to reorder category" + error);
        },
    });
};
