import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreateReview } from "@/lib/hooks/useReview";

const reviewSchema = z.object({
    rating: z.number().min(1, "Rating is required").max(5, "Max rating is 5"),
    author: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required").max(100),
    comment: z.string().min(10, "Minimum 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    onClose: () => void;
    productName: string;
    product_id: number;
}

export const ReviewForm = ({ onClose, productName, product_id }: ReviewFormProps) => {
    const addReview = useCreateReview();
    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            author: "",
            title: "",
            comment: "",
        },
    });

    const { handleSubmit, setValue, watch, reset, formState } = form;
    const rating = watch("rating");
    const title = watch("title");
    const comment = watch("comment");

    const onSubmit = (values: ReviewFormValues) => {
        addReview.mutateAsync({ product_id, ...values }).then(() => {
            reset();
            onClose();
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Write a Review for {productName}</h2>
            </div>
            <Form {...form}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Overall Rating *</FormLabel>
                                <FormControl>
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                                className="p-1 hover:scale-110 transition-transform"
                                                type="button"
                                                onClick={() => setValue("rating", star, { shouldValidate: true })}
                                            >
                                                <Star
                                                    className={`w-8 h-8 transition-colors ${
                                                        star <= (rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">{rating} out of 5 stars</span>}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Name *</FormLabel>
                                <FormControl>
                                    <Input {...field} className="w-full" id="author" placeholder="Enter your name" type="text" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Review Title *</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-full"
                                        id="title"
                                        maxLength={100}
                                        placeholder="Summarize your experience"
                                        type="text"
                                    />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Review *</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        className="w-full resize-none"
                                        id="comment"
                                        placeholder="Share your experience with this product..."
                                        rows={5}
                                    />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Minimum 10 characters ({comment.length} characters)</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button className="flex-1" type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            disabled={!formState.isValid || addReview.isPending}
                            isLoading={addReview.isPending}
                            type="submit"
                            variant="indigo"
                        >
                            Submit Review
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
};
