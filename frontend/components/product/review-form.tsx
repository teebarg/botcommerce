"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateReview } from "@/lib/hooks/useReview";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const reviewSchema = z.object({
    rating: z.number().min(1, "Rating is required").max(5, "Max rating is 5"),
    comment: z.string().min(1, "Comment is required"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    className?: string;
    product_id: number;
}

export default function CreateReviewForm({ product_id, className = "" }: ReviewFormProps) {
    const addReview = useCreateReview();
    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 1, comment: "" },
    });

    const { handleSubmit, reset, control, setValue, watch } = form;
    const rating = watch("rating");

    const onSubmit = async (values: ReviewFormValues) => {
        await addReview.mutateAsync({ product_id, ...values });
        reset();
    };

    return (
        <Form {...form}>
            <form className={`space-y-4 w-full max-w-xl mx-auto text-center mt-4 ${className}`} onSubmit={handleSubmit(onSubmit)}>
                <FormField
                    control={control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <FormControl>
                                <div className="flex items-center justify-center mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`${star <= field.value ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                                            onClick={() => setValue("rating", star)}
                                        >
                                            <Star className="h-8 w-8" />
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Review</FormLabel>
                            <FormControl>
                                <Textarea className="mt-1" id="comment" placeholder="Write your review here..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button aria-label="submit review" isLoading={addReview.isPending} size="lg" type="submit" variant="primary">
                    Submit Review
                </Button>
            </form>
        </Form>
    );
}
