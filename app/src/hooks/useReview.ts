import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createReviewFn, deleteReviewFn, updateReviewFn } from "@/server/review.server";

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
        mutationFn: async (input: CreateReviewInput) => await createReviewFn({ data: input }),
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
        mutationFn: async ({ id, input }: UpdateReviewPayload) => await updateReviewFn({ data: { id, input } }),
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
        mutationFn: async (id: number) => await deleteReviewFn({ data: id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review successfully deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete review");
        },
    });
};
