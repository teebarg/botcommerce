import { Star, ThumbsUp, Shield } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Review } from "@/types/review";

interface ReviewCardProps {
    review: Review;
    onHelpful?: (reviewId: string) => void;
}

export const ReviewCard = ({ review, onHelpful }: ReviewCardProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Card className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-foreground">{review.rating} out of 5 stars</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{review.title}</h3>
                </div>
                {review.verified && (
                    <Badge className="flex items-center space-x-1" variant="secondary">
                        <Shield className="w-3 h-3" />
                        <span>Verified Purchase</span>
                    </Badge>
                )}
            </div>

            {/* Review Content */}
            <p className="text-foreground leading-relaxed">{review.comment}</p>

            {/* Author and Date */}
            <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                    By <span className="font-medium">{review.author}</span> on {formatDate(review.date)}
                </div>

                {/* Helpful Button */}
                <Button className="text-muted-foreground hover:text-foreground" size="sm" variant="ghost" onClick={() => onHelpful?.(review.id)}>
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpful})
                </Button>
            </div>
        </Card>
    );
};
