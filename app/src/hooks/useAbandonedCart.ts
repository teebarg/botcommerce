import { toast } from "sonner";
import { api } from "@/utils/api";
import { CartListResponse, Message } from "@/schemas";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useAbandonedCarts(search: string) {
    return useInfiniteQuery({
        queryKey: ["abandoned-carts", { search }],
        queryFn: ({ pageParam = 0 }) =>
            api.get<CartListResponse>("/abandoned-carts/", { params: { skip: pageParam, limit: PAGE_SIZE, search: search || undefined } }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.skip + lastPage.limit : undefined),
    });
}

export function useDeleteAbandonedCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete<Message>(`/abandoned-carts/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["abandoned-carts"] }),
    });
}

export const useSendCartReminder = () => {
    return useMutation({
        mutationFn: async (cartId: number) => await api.post<Message>(`/abandoned-carts/${cartId}/send-reminder`),
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
        mutationFn: async ({ hours_threshold }: { hours_threshold: number }) =>
            await api.post<Message>("/abandoned-carts/send-reminders", {
                hours_threshold,
            }),
        onSuccess: () => {
            toast.success("Recovery email sent");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send recovery email");
        },
    });
};
