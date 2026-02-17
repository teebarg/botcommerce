import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientApi } from "@/utils/api.client";
import { Message, Review } from "@/schemas";

type CreateReviewInput = {
    product_id: number;
    author: string;
    title: string;
    rating: number;
    comment: string;
};

type UpdateReviewPayload = {
    id: number;
    input: {
        rating?: number;
        comment?: string;
        verified?: boolean;
    };
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateReviewInput) => await clientApi.post<Review>("/reviews/", input),
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
        mutationFn: async ({ id, input }: UpdateReviewPayload) => await clientApi.patch<Review>(`/reviews/${id}`, input),
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
        mutationFn: async (id: number) => await clientApi.delete<Message>(`/reviews/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete review");
        },
    });
};
