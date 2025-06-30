import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useInvalidate } from "./useApi";

import { api } from "@/apis/client";
import { Brand, PaginatedBrand } from "@/schemas";
import { BrandFormValues } from "@/components/admin/brands/brand-form";

interface SearchParams {
    search?: string;
    page?: number;
    limit?: number;
}

export const useBrands = (searchParams: SearchParams) => {
    return useQuery({
        queryKey: ["brands", JSON.stringify(searchParams)],
        queryFn: async () => await api.get<PaginatedBrand>("/brand/", { params: { ...searchParams } }),
    });
};

export const useBrandsAll = (search?: string) => {
    return useQuery({
        queryKey: ["brands", "all", search],
        queryFn: async () => await api.get<Brand[]>("/brand/all", { params: { search: search || "" } }),
    });
};

export const useCreateBrand = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (data: BrandFormValues) =>
            await api.post<Brand>("/brand/", {
                ...data,
            }),
        onSuccess: () => {
            invalidate("brands");
            toast.success("Brand created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create brand" + error);
        },
    });
};

export const useUpdateBrand = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: BrandFormValues }) => await api.patch<Brand>(`/brand/${id}`, data),
        onSuccess: () => {
            invalidate("brands");
            toast.success("Brand updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update brand" + error);
        },
    });
};

export const useDeleteBrand = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Brand>(`/brand/${id}`),
        onSuccess: () => {
            invalidate("brands");
            toast.success("Brand deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete brand" + error);
        },
    });
};
