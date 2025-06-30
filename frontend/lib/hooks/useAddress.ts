import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { PaginatedAddress, Address, Message } from "@/schemas";

export const useAddresses = (params?: { search?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ["user-address", JSON.stringify(params)],
        queryFn: async () => await api.get<PaginatedAddress>("/address/", { params }),
    });
};

export const useAddress = (id: number) => {
    return useQuery({
        queryKey: ["cart-address", id],
        queryFn: async () => await api.get<Address>(`/address/${id}`),
        enabled: !!id,
    });
};

export const useCreateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: any) => await api.post<Address>(`/address/`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-address"] });
            toast.success("Address successfully created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create address");
        },
    });
};

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.patch<Address>(`/address/${id}`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-address"] });
            toast.success("Address successfully updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update address");
        },
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/address/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-address"] });
            toast.success("Address successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete address");
        },
    });
};
