import { Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ReviewActions } from "./reviews-actions";
import type { Review } from "@/schemas";
import { Badge } from "@/components/ui/badge";

interface ReviewListProps {
    review: Review;
}

const ReviewItem = ({ review }: ReviewListProps) => {
    return (
        <div>
            <div className="py-6">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                        Product #{review?.product_id}
                    </p>
                    <Badge variant={review?.verified ? "success": "ghost"}>{review?.verified ? "Verified" : "Unverified"}</Badge>
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
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {review?.comment}
                </p>
                <div className="rounded-xl border bg-muted/40 px-5 py-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {new Date(review?.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                    <ReviewActions review={review} />
                </div>
            </div>
            <Separator />
        </div>
    );
};

export default ReviewItem;