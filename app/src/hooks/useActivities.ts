import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientApi } from "@/utils/api.client";

export const useDeleteActivity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => await clientApi.delete<void>(`/activities/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["activities"] })
            toast.success("Activity deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed " + error);
        },
    });
};
