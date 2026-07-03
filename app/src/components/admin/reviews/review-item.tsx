import { Star } from "lucide-react";
import { ReviewActions } from "./reviews-actions";
import type { Review } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/utils";

interface ReviewListProps {
    review: Review;
}

const ReviewItem = ({ review }: ReviewListProps) => {
    return (
        <div className="rounded-2xl border overflow-hidden bg-card border-border">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground w-auto">Product #{review?.product_id}</p>
                    <Badge variant={review?.verified ? "success" : "ghost"}>{review?.verified ? "Verified" : "Unverified"}</Badge>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={i < review?.rating ? "fill-warning text-warning" : "fill-muted text-muted"}
                        />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {review?.comment}
                </p>
            </div>
            <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-muted/40">
                <div className="text-xs text-muted-foreground">
                    {timeAgo(review?.created_at)}
                </div>
                <ReviewActions review={review} />
            </div>
        </div>
    );
};

export default ReviewItem;