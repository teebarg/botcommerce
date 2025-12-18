import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CategoryFormValues } from "@/components/admin/categories/category-form";
import { createCategoryFn, deleteCategoryFn, getCategoriesFn, reorderCategoriesFn, updateCategoryFn } from "@/server/categories.server";

export const categoriesQuery = (query?: string) => queryOptions({
    queryKey: ["categories", query],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: () => getCategoriesFn({ data: query }),
});

export const useCategories = (query?: string) => useQuery(categoriesQuery(query));


export const useCreateCategory = () => {
    return useMutation({
        mutationFn: async (data: CategoryFormValues) => await createCategoryFn({ data }),
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
        mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => await updateCategoryFn({ data: { id, data } }),
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
        mutationFn: async (id: number) => await deleteCategoryFn({ data: id }),
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
        mutationFn: async (data: { id: number; display_order: number }[]) => await reorderCategoriesFn({ data: { categories: data } }),
        onSuccess: () => {
            toast.success("Category reordered successfully");
        },
        onError: (error) => {
            toast.error("Failed to reorder category" + error);
        },
    });
};
