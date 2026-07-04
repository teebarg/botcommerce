import type React from "react";
import { useState } from "react";
import { Star, Filter } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { useQuery } from "@tanstack/react-query";
import { ProductReviewsZeroState } from "../store/reviews/review-zero";
import type { PaginatedReview, Review, ReviewStatus, SortBy } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewCard } from "@/components/store/reviews/review-card";
import SheetDrawer from "@/components/sheet-drawer";
import { ReviewForm } from "../store/reviews/review-form";
import { api } from "@/utils/api";
import ReviewsLoader from "./product-review-loader";

interface Prop {
    product_id: number;
    productName: string;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName }) => {
    const state = useOverlayTriggerState({});
    const [sort, setSort] = useState<SortBy>("newest");
    const {data: reviewsData, isPending} = useQuery({
        queryKey: ["reviews", { product_id, sort }],
        queryFn: () => api.get<PaginatedReview>("/reviews/", { params: { product_id, sort } }),
    })
    const { data } = useQuery({
        queryKey: ["products", product_id, "review-status"],
        queryFn: async () => await api.get<ReviewStatus>(`/product/${product_id}/review-status`),
    });

    const { items, ratings } = reviewsData || {};
    const getPercentage = (count: number) => (count / (ratings?.count || 1)) * 100;

    if (isPending) return <ReviewsLoader />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="mb-6">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Reviews</p>
                <h2 className="font-display font-semibold">Customer reviews & ratings</h2>
            </div>
            {items?.length === 0 ? (
                <ProductReviewsZeroState productName={productName} product_id={product_id} />
            ) : (
                <>
                    <div className="rounded-xl border border-border bg-card p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <span className="text-3xl font-semibold">{ratings?.average?.toFixed(1)}</span>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= Math.round(ratings?.average || 0)
                                                    ? "text-accent fill-accent"
                                                    : "text-muted-foreground"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Based on {ratings?.count} review{ratings?.count !== 1 ? "s" : ""}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-6">{rating}★</span>
                                        <div className="flex-1 bg-secondary rounded-full h-1.5">
                                            <div
                                                className="bg-foreground h-1.5 rounded-full transition-all"
                                                style={{ width: `${getPercentage(ratings?.breakdown?.[rating])}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-6 text-right">{ratings?.breakdown?.[rating]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                        <p className="text-sm font-medium">{ratings?.count} review{ratings?.count !== 1 ? "s" : ""}</p>
                        <div className="flex items-center gap-2">
                            <Select defaultValue={sort} onValueChange={(v) => setSort(v as SortBy)}>
                                <SelectTrigger className="w-36">
                                    <Filter className="w-3.5 h-3.5 mr-1.5" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest first</SelectItem>
                                    <SelectItem value="oldest">Oldest first</SelectItem>
                                    <SelectItem value="highest">Highest rated</SelectItem>
                                    <SelectItem value="lowest">Lowest rated</SelectItem>
                                </SelectContent>
                            </Select>
                            {data && data.has_purchased && !data.has_reviewed && (
                                <SheetDrawer
                                    open={state.isOpen}
                                    title="Write a review"
                                    trigger={<Button className="rounded-full">Write a review</Button>}
                                    onOpenChange={state.setOpen}
                                >
                                    <ReviewForm product_id={product_id} onClose={state.close} />
                                </SheetDrawer>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {items?.map((review: Review, idx: number) => (
                            <ReviewCard key={idx} review={review} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewsSection;