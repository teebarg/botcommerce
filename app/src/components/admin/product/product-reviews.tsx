import { useState } from "react";
import { Star } from "lucide-react";

import ReviewItem, { type Review } from "./review-item";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
}

const ProductReviews = ({ productId, reviews }: ProductReviewsProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [allReviews, setAllReviews] = useState<Review[]>(reviews);

    const averageRating = allReviews.length > 0 ? allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length : 0;

    const roundedRating = Math.round(averageRating * 10) / 10;

    return (
        <div className="bg-white rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
                    <div className="flex items-center mt-1">
                        <div className="flex mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={
                                        star <= Math.floor(averageRating)
                                            ? "fill-warning text-warning"
                                            : star <= Math.ceil(averageRating) && star > Math.floor(averageRating)
                                              ? "fill-warning/50 text-warning"
                                              : "text-gray-300"
                                    }
                                    size={16}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">
                            {roundedRating} ({allReviews.length})
                        </span>
                    </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                    Manage
                </Button>
            </div>

            {allReviews.length > 0 ? (
                <div className="space-y-1">
                    {allReviews.slice(0, 3).map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}
                    {allReviews.length > 3 && (
                        <Button className="w-full mt-2 text-primary" variant="ghost" onClick={() => setDialogOpen(true)}>
                            View all {allReviews.length} reviews
                        </Button>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No reviews yet</p>
                </div>
            )}

            <ReviewsDialog
                open={dialogOpen}
                productId={productId}
                reviews={allReviews}
                onOpenChange={setDialogOpen}
                onReviewsChange={setAllReviews}
            />
        </div>
    );
};

interface ReviewsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reviews: Review[];
    productId: string;
    onReviewsChange: (reviews: Review[]) => void;
}

const ReviewsDialog = ({ open, onOpenChange, reviews, productId, onReviewsChange }: ReviewsDialogProps) => {
    const [selectedReview, setSelectedReview] = useState<string | null>(null);

    const handleDeleteReview = (id: string) => {
        const updatedReviews = reviews.filter((review) => review.id !== id);

        onReviewsChange(updatedReviews);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle>Manage Reviews</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 py-4 last:border-0">
                            <ReviewItem review={review} />
                            <div className="flex justify-end mt-2 gap-2">
                                <Button size="sm" variant="outline" onClick={() => setSelectedReview(review.id)}>
                                    Reply
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}

                    {reviews.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No reviews yet</p>
                        </div>
                    )}
                </div>

                {selectedReview && (
                    <div className="border-t p-4">
                        <h4 className="text-sm font-medium mb-2">Reply to Review</h4>
                        <Textarea className="mb-2" placeholder="Write your reply..." rows={3} />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedReview(null)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={() => setSelectedReview(null)}>
                                Send Reply
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ProductReviews;
