import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Message, PaginatedReview, Review } from "@/schemas";

export const useReviews = (params: { skip?: number; limit?: number }) => {
    return useQuery({
        queryKey: ["reviews"],
        queryFn: async () => await api.get<PaginatedReview>("/reviews/", { params: { ...params } }),
    });
};

export const useReview = (id: number) => {
    return useQuery({
        queryKey: ["review", id],
        queryFn: async () => await api.get<Review>(`/reviews/${id}`),
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { product_id: number; rating: number; comment: string }) => await api.post<Review>(`/reviews/`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review successfully created");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create review");
        },
    });
};

export const useUpdateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: { rating?: number; comment?: string; verified?: boolean } }) =>
            await api.patch<Review>(`/reviews/${id}`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review successfully updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update review");
        },
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/reviews/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete review");
        },
    });
};
