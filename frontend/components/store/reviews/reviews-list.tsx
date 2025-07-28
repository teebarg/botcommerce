import { Star, Filter } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useSearchParams } from "next/navigation";

import { ReviewForm } from "./review-form";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewCard } from "@/components/store/reviews/review-card";
import { PaginatedReview, Review } from "@/schemas";
import Overlay from "@/components/overlay";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";

interface ReviewsListProps {
    data: PaginatedReview;
    productName: string;
    product_id: number;
    hasPurchased?: boolean;
    hasReviewed?: boolean;
}

export const ReviewsList = ({ data, productName, product_id, hasPurchased, hasReviewed }: ReviewsListProps) => {
    const state = useOverlayTriggerState({});
    const { reviews, ratings } = data;
    const { updateQuery } = useUpdateQuery(200);
    const searchParams = useSearchParams();
    const sort = searchParams.get("sort") || "newest";

    const getPercentage = (count: number) => (count / ratings?.count) * 100;

    const onSortChange = (sort: string) => {
        updateQuery([
            { key: "sort", value: sort },
            { key: "skip", value: "0" },
        ]);
    };

    return (
        <div className="space-y-6">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-default-700 mt-2 mb-6 text-center font-semibold">Customer Reviews & Ratings</p>
                <Card className="p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                                <span className="text-4xl font-bold text-foreground">{ratings?.average?.toFixed(1)}</span>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 ${
                                                star <= Math.round(ratings?.average || 0)
                                                    ? "text-yellow-500 fill-yellow-500"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Based on {ratings?.count} review{ratings?.count !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center space-x-3">
                                    <span className="text-sm text-muted-foreground w-6">{rating}★</span>
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${getPercentage(ratings?.breakdown?.[rating])}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-8">{ratings?.breakdown?.[rating]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Customer Reviews ({ratings?.count})</h2>

                    <div className="flex items-center space-x-3">
                        <Select defaultValue={sort} onValueChange={onSortChange}>
                            <SelectTrigger className="w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="highest">Highest Rated</SelectItem>
                                <SelectItem value="lowest">Lowest Rated</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasPurchased && !hasReviewed && (
                            <Overlay
                                open={state.isOpen}
                                sheetClassName="min-w-120"
                                title="Write the First Review"
                                trigger={
                                    <Button className="w-full md:w-auto px-8" variant="indigo">
                                        Write a Review
                                    </Button>
                                }
                                onOpenChange={state.setOpen}
                            >
                                <ReviewForm productName={productName} product_id={product_id} onClose={state.close} />
                            </Overlay>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {reviews.map((review: Review, idx: number) => (
                        <ReviewCard key={idx} review={review} />
                    ))}
                </div>
            </div>
        </div>
    );
};
