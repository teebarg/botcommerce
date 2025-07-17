import { Star, Filter, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewCard } from "@/components/ReviewCard";
import { Review } from "@/types/review";

interface ReviewsListProps {
    reviews: Review[];
    onWriteReview: () => void;
    onHelpful: (reviewId: string) => void;
    productName: string;
}

export const ReviewsList = ({ reviews, onWriteReview, onHelpful, productName }: ReviewsListProps) => {
    // Calculate rating statistics
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const ratingCounts = [5, 4, 3, 2, 1].map((rating) => reviews.filter((review) => review.rating === rating).length);

    const getPercentage = (count: number) => (count / reviews.length) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{productName}</h1>
                    <p className="text-muted-foreground mt-2">Customer Reviews & Ratings</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Rating Summary */}
                <Card className="p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Overall Rating */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                                <span className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 ${
                                                star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating, index) => (
                                <div key={rating} className="flex items-center space-x-3">
                                    <span className="text-sm text-muted-foreground w-6">{rating}★</span>
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${getPercentage(ratingCounts[index])}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-8">{ratingCounts[index]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Reviews Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Customer Reviews ({reviews.length})</h2>

                    <div className="flex items-center space-x-3">
                        <Select defaultValue="newest">
                            <SelectTrigger className="w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="highest">Highest Rated</SelectItem>
                                <SelectItem value="lowest">Lowest Rated</SelectItem>
                                <SelectItem value="helpful">Most Helpful</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={onWriteReview}>Write a Review</Button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} onHelpful={onHelpful} />
                    ))}
                </div>
            </div>
        </div>
    );
};
