import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientApi } from "@/utils/api.client";
import { Message } from "@/schemas";

export const useSendCartReminder = () => {
    return useMutation({
        mutationFn: async (cartId: number) => await clientApi.post<Message>(`/cart/abandoned-carts/${cartId}/send-reminder`),
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};

export const useSendCartReminders = () => {
    return useMutation({
        mutationFn: async ({ hours_threshold, limit = 20 }: { hours_threshold: number; limit?: number }) =>
            await clientApi.post<Message>("/cart/abandoned-carts/send-reminders", {
                hours_threshold,
                limit,
            }),
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};
