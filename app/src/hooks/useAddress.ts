import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAddressFn, deleteAddressFn, getUserAddressesFn, updateAddressFn } from "@/server/address.server";

export const useUserAddresses = () => {
    // const session: any = null;

    return useQuery({
        queryKey: ["addresses"],
        queryFn: () => getUserAddressesFn(),
        // enabled: Boolean(session?.user),
    });
};

export const useCreateAddress = () => {
    return useMutation({
        mutationFn: async (input: any) => await createAddressFn({ data: input }),
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
        mutationFn: async ({ id, input }: { id: number; input: any }) => await updateAddressFn({ data: { id, input } }),
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
        mutationFn: async (id: number) => await deleteAddressFn({ data: id }),
        onSuccess: () => {
            toast.success("Address successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete address");
        },
    });
};
