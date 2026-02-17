import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserAddressesFn } from "@/server/address.server";
import { useRouteContext } from "@tanstack/react-router";
import { clientApi } from "@/utils/api.client";
import { Address, Message } from "@/schemas";

export const useUserAddresses = () => {
    const { session } = useRouteContext({ strict: false });

    return useQuery({
        queryKey: ["addresses", session?.id?.toString()],
        queryFn: () => getUserAddressesFn(),
        enabled: Boolean(session?.user),
    });
};

export const useCreateAddress = () => {
    return useMutation({
        mutationFn: async (input: any) => await clientApi.post<Address>("/address/", input),
        onSuccess: () => {
            toast.success("Address successfully created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create address");
        },
    });
};

export const useUpdateAddress = () => {
    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await clientApi.patch<Address>(`/address/${id}`, input),
        onSuccess: () => {
            toast.success("Address successfully updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update address");
        },
    });
};

export const useDeleteAddress = () => {
    return useMutation({
        mutationFn: async (id: number) => await clientApi.delete<Message>(`/address/${id}`),
        onSuccess: () => {
            toast.success("Address successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete address");
        },
    });
};
