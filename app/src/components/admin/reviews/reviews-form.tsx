import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Review } from "@/schemas";
import { useUpdateReview } from "@/hooks/useReview";
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
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex-1 overflow-y-auto px-2 space-y-4">
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                    <Input max={5} min={1} type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
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
                </div>
                <div className="sheet-footer">
                    <Button aria-label="cancel" className="min-w-32" type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button aria-label="update" className="min-w-32" isLoading={isPending} type="submit">
                        Update
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export { UpdateReviewForm };
