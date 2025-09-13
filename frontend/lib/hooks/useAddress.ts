import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Address, Message } from "@/schemas";
import { useSession } from "next-auth/react";

export const useUserAddresses = () => {
    const { data: session } = useSession();
    return useQuery({
        queryKey: ["addresses", session?.id?.toString()],
        queryFn: async () => {
            const res = await api.get<{ addresses: Address[] }>("/address/");

            return res;
        },
        enabled: Boolean(session?.user),
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
    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: any }) => await api.patch<Address>(`/address/${id}`, input),
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
        mutationFn: async (id: number) => await api.delete<Message>(`/address/${id}`),
        onSuccess: () => {
            toast.success("Address successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete address");
        },
    });
};
