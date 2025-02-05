"use client";

import { Star } from "nui-react-icons";
import { useState } from "react";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addReview } from "@/modules/products/actions";
import { useSnackbar } from "notistack";

interface ReviewFormProps {
    className?: string;
    product_id: number;
}

export default function ReviewForm({ product_id, className = "" }: ReviewFormProps) {
    const [rating, setRating] = useState<number>(1);
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await addReview(product_id, rating, comment);
        setLoading(false);
        if (res.error) {
            enqueueSnackbar(res.message, { variant: "error" });
            return;
        }
        // Reset form
        setRating(0);
        setComment("");
        enqueueSnackbar("Review successfully added", { variant: "success" });
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 w-full max-w-xl mx-auto text-center mt-4 ${className}`}>
            <div>
                <label className="block text-sm font-medium text-default-700">Rating</label>
                <div className="flex items-center justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                        >
                            <Star className="h-8 w-8" />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-default-700">
                    Your Review
                </label>
                <TextArea
                    id="comment"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e)}
                    placeholder="Write your review here..."
                    className="mt-1"
                    isRequired
                />
            </div>

            <Button size="md" type="submit" isLoading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Submit Review
            </Button>
        </form>
    );
}
