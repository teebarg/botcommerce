import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendCartReminderFn, sendCartRemindersFn } from "@/server/abandoned-cart.server";

export const useSendCartReminder = () => {
    return useMutation({
        mutationFn: async (cartId: number) => await sendCartReminderFn({ data: { cartId } }),
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
            await sendCartRemindersFn({ data: { hours_threshold, limit } }),
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};
