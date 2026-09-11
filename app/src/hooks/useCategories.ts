import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CategoryFormValues } from "@/components/admin/categories/category-form";
import { api } from "@/utils/api";
import { Category } from "@/schemas";

export const useCategories = (query?: string) => {
    return useQuery({
        queryKey: ["categories", query],
        queryFn: () => api.get<Category[]>("/category/", { params: { query } }),
    });
};

export const useCreateCategory = () => {
    return useMutation({
        mutationFn: async (data: CategoryFormValues) => await api.post<Category>("/category/", data),
        onSuccess: () => {
            toast.success("category created");
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
            toast.success("category updated");
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
            toast.success("category deleted");
        },
        onError: (error) => {
            toast.error("Failed to delete category" + error);
        },
    });
};

export const useReorderCategories = () => {
    return useMutation({
        mutationFn: async (data: { id: number; display_order: number }[]) =>
            await api.patch<Category>(`/category/reorder`, { categories: data }),
        onSuccess: () => {
            toast.success("category reordered");
        },
        onError: (error) => {
            toast.error("Failed to reorder category" + error);
        },
    });
};
