import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserAddressesFn } from "@/server/store.server";
import { useRouteContext } from "@tanstack/react-router";
import { api } from "@/utils/api";
import { Address, Message } from "@/schemas";

export const useUserAddresses = () => {
    const { isAuthenticated, userId } = useRouteContext({ strict: false });
    return useQuery({
        queryKey: ["addresses", `${userId}`],
        queryFn: () => getUserAddressesFn(),
        enabled: isAuthenticated,
    });
};

export const useCreateAddress = () => {
    return useMutation({
        mutationFn: async (input: any) => await api.post<Address>("/address/", input),
        onSuccess: () => {
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
            queryClient.invalidateQueries({ queryKey: ["cart"] })
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
            queryClient.invalidateQueries({ queryKey: ["cart"] })
            toast.success("Address successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete address");
        },
    });
};
