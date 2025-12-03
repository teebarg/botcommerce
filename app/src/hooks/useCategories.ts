import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Category } from "@/schemas";
import { CategoryFormValues } from "@/components/admin/categories/category-form";
import { GetCategoriesFn } from "@/server/categories-server";

export const useCategories = (query?: string) => {
    return useQuery({
        queryKey: ["categories", query],
        queryFn: async () => GetCategoriesFn({ data: { query } }),
    });
};

export const useCreateCategory = () => {
    return useMutation({
        mutationFn: async (data: CategoryFormValues) =>
            await api.post<Category>("/category/", {
                ...data,
            }),
        onSuccess: () => {
            toast.success("Category created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create category" + error);
        },
    });
};

export const useUpdateCategory = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => await api.patch<Category>(`/category/${id}`, data),
        onSuccess: () => {
            toast.success("Category updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update category" + error);
        },
    });
};

export const useDeleteCategory = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<Category>(`/category/${id}`),
        onSuccess: () => {
            toast.success("Category deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete category" + error);
        },
    });
};

export const useReorderCategories = () => {
    return useMutation({
        mutationFn: async (data: { id: number; display_order: number }[]) => await api.patch<Category>(`/category/reorder`, { categories: data }),
        onSuccess: () => {
            toast.success("Category reordered successfully");
        },
        onError: (error) => {
            toast.error("Failed to reorder category" + error);
        },
    });
};
