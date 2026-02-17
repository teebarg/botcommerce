import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientApi } from "@/utils/api.client";

export const useDeleteActivity = () => {
    return useMutation({
        mutationFn: async (id: number) => await clientApi.delete<void>(`/activities/${id}`),
        onSuccess: () => {
            toast.success("Activity deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed " + error);
        },
    });
};
