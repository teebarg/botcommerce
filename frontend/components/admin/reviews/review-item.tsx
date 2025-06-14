import { Star } from "lucide-react";

import { ReviewActions } from "./reviews-actions";

import { Card } from "@/components/ui/card";
import { Review } from "@/schemas";

interface ReviewListProps {
    review: Review;
    deleteAction: (id: number) => void;
}

const ReviewItem = ({ review, deleteAction }: ReviewListProps) => {
    return (
        <div className="space-y-4">
            <Card key={review.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={i < review.rating ? "fill-warning text-warning" : "text-gray-300"} size={16} />
                            ))}
                        </div>
                        <p className="text-sm text-default-500 mt-1">Product ID: {review.product_id}</p>
                    </div>
                    <span
                        className={`text-xs px-2 py-1 rounded-full ${
                            review.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                        {review.verified ? "Verified" : "Un-verified"}
                    </span>
                </div>

                <p className="mt-2 text-sm text-default-900">{review.comment}</p>
                <p className="mt-2 text-xs text-default-500 mb-4">Posted on {new Date(review.created_at).toLocaleDateString()}</p>
                <ReviewActions deleteAction={deleteAction} review={review} />
            </Card>
        </div>
    );
};

export default ReviewItem;
