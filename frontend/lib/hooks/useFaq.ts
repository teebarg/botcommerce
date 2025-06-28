import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { FAQ, Message } from "@/schemas";
import { FaqFormValues } from "@/components/admin/faq/faq-form";
import { useInvalidate } from "./useApi";

export const useFaqs = () => {
    return useQuery({
        queryKey: ["faqs"],
        queryFn: async () => await api.get<FAQ[]>("/faq/"),
    });
};

export const useCreateFaq = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async (data: FaqFormValues) =>
            await api.post<Message>("/faq", {
                ...data,
            }),
        onSuccess: () => {
            invalidate("faqs");
            toast.success("FAQ created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create FAQ" + error);
        },
    });
};

export const useUpdateFaq = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FaqFormValues }) => await api.patch<Message>(`/faq/${id}`, data),
        onSuccess: () => {
            invalidate("faqs");
            toast.success("FAQ updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update FAQ" + error);
        },
    });
};

export const useDeleteFaq = () => {
    const invalidate = useInvalidate();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<FAQ>(`/faq/${id}`),
        onSuccess: () => {
            invalidate("faqs");
            toast.success("FAQ deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete FAQ" + error);
        },
    });
};
