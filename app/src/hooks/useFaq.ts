import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FaqFormValues } from "@/components/admin/faq/faq-form";
import { clientApi } from "@/utils/api.client";
import { FAQ, Message } from "@/schemas";

export const useCreateFaq = () => {
    return useMutation({
        mutationFn: async (data: FaqFormValues) => clientApi.post<Message>("/faq/", data),
        onSuccess: () => {
            toast.success("FAQ created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create FAQ" + error);
        },
    });
};

export const useUpdateFaq = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FaqFormValues }) => await clientApi.patch<Message>(`/faq/${id}`, data),
        onSuccess: () => {
            toast.success("FAQ updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update FAQ" + error);
        },
    });
};

export const useDeleteFaq = () => {
    return useMutation({
        mutationFn: async (id: number) => await clientApi.delete<FAQ>(`/faq/${id}`),
        onSuccess: () => {
            toast.success("FAQ deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete FAQ" + error);
        },
    });
};
