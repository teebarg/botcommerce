import { Star, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/schemas";
import { formatDate } from "@/utils";

interface ReviewCardProps {
    review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${star <= review.rating ? "text-accent fill-accent" : "text-muted-foreground"}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                    </div>
                    <h3 className="text-sm font-medium">{review.title}</h3>
                </div>
                {review.verified && (
                    <Badge variant="success-subtle" className="flex items-center gap-1 shrink-0">
                        <Shield className="w-3 h-3" />
                        Verified
                    </Badge>
                )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.comment}</p>

            <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                By <span className="font-medium text-foreground">{review.author}</span> · {formatDate(review.created_at)}
            </p>
        </div>
    );
};