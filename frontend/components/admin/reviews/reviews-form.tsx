"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Review } from "@/schemas";
import { useUpdateReview } from "@/lib/hooks/useReview";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface Props {
    review: Review;
    onClose?: () => void;
}

const reviewSchema = z.object({
    rating: z.number().min(1, "Rating is required").max(5, "Max rating is 5"),
    comment: z.string().min(1, "Comment is required"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const UpdateReviewForm: React.FC<Props> = ({ onClose, review }) => {
    const { mutate, isPending, isSuccess } = useUpdateReview();
    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: review?.rating ?? 1,
            comment: review?.comment ?? "",
        },
    });

    useEffect(() => {
        if (isSuccess) {
            form.reset();
            onClose?.();
        }
    }, [isSuccess]);

    const onSubmit = (values: ReviewFormValues) => {
        mutate({ id: review?.id!, input: values });
    };

    return (
        <div className="py-8 px-2 md:px-4">
            <h1 className="text-lg font-semibold mb-4">Update Review</h1>
            <Form {...form}>
                <form className="h-full flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                    <Input max={5} min={1} type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Great product." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center justify-end py-4 space-x-2 mt-4">
                        <Button aria-label="cancel" className="min-w-32" type="button" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="update" className="min-w-32" isLoading={isPending} type="submit" variant="primary">
                            Update
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export { UpdateReviewForm };
