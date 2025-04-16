"use client";

import { Star } from "nui-react-icons";
import { useState } from "react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useCart";

interface ReviewFormProps {
    className?: string;
    product_id: number;
}

export default function ReviewForm({ product_id, className = "" }: ReviewFormProps) {
    const [rating, setRating] = useState<number>(1);
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await api.product.addReview({ product_id, rating, comment });

        setLoading(false);
        if (error) {
            toast.error(error);

            return;
        }
        invalidate("product-reviews");
        // Reset form
        setRating(1);
        setComment("");
        toast.success("Review successfully added");
    };

    return (
        <form className={`space-y-4 w-full max-w-xl mx-auto text-center mt-4 ${className}`} onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-default-700">Rating</label>
                <div className="flex items-center justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                            type="button"
                            onClick={() => setRating(star)}
                        >
                            <Star className="h-8 w-8" />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-default-700" htmlFor="comment">
                    Your Review
                </label>
                <Textarea
                    required
                    className="mt-1"
                    id="comment"
                    name="comment"
                    placeholder="Write your review here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            <Button aria-label="submit review" isLoading={loading} size="lg" type="submit">
                Submit Review
            </Button>
        </form>
    );
}
