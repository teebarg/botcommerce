import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Message } from "@/schemas";
import { ContactFormValues } from "@/components/store/contact-form";

export const useSubscribeNewsletter = () => {
    return useMutation({
        mutationFn: async (data: { email: string }) =>
            await api.post<Message>(`/newsletter`, {
                email: data.email,
            }),
        onSuccess: () => {
            toast.success("Successfully subscribed to newsletter");
        },
        onError: (error) => {
            toast.error("Failed to subscribe to newsletter" + error);
        },
    });
};

export const useContactForm = () => {
    return useMutation({
        mutationFn: async (data: ContactFormValues) => await api.post<Message>(`/contact-form`, data),
        onSuccess: () => {
            toast.success("Successfully sent message");
        },
        onError: (error) => {
            toast.error("Failed to send message" + error);
        },
    });
};
