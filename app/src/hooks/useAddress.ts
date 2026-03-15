import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserAddressesFn } from "@/server/store.server";
import { useRouteContext } from "@tanstack/react-router";
import { clientApi } from "@/utils/api.client";
import { Address, Message } from "@/schemas";

export const useUserAddresses = () => {
    const { isAuthenticated } = useRouteContext({ strict: false });

    return useQuery({
        queryKey: ["addresses"],
        queryFn: () => getUserAddressesFn(),
        enabled: isAuthenticated,
    });
};

export const useCreateAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: any) => await clientApi.post<Address>("/address/", input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] })
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
        mutationFn: async ({ id, input }: { id: number; input: any }) => await clientApi.patch<Address>(`/address/${id}`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] })
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
        mutationFn: async (id: number) => await clientApi.delete<Message>(`/address/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] })
            queryClient.invalidateQueries({ queryKey: ["cart"] })
            toast.success("Address successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete address");
        },
    });
};
