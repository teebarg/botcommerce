"use client";

import React from "react";
import { Star } from "lucide-react";

import { ProductReviewsZeroState } from "../store/reviews/review-zero";

import CreateReviewForm from "./review-form";

import { Badge } from "@/components/ui/badge";
import Progress from "@/components/ui/progress";
import { timeAgo } from "@/lib/utils";
import { Review } from "@/schemas";
import { useProductReviews } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/lib/hooks/useOrder";

interface Prop {
    product_id: number;
    productName: string;
}

interface RatingDistribution {
    stars: number;
    percentage: number;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName }) => {
    const { data: reviews, isLoading } = useProductReviews(product_id);
    const { user, loading: userLoading } = useAuth();
    const { data: orders, isLoading: ordersLoading } = useOrders({});

    if (isLoading || userLoading || ordersLoading) {
        return <ComponentLoader className="min-h-[400px]" />;
    }

    // Check if user is logged in
    const isLoggedIn = !!user;
    // Check if user has already reviewed this product
    const hasReviewed = isLoggedIn && reviews?.some((r) => r.user?.id === user?.id);
    // Check if user has purchased this product
    let hasPurchased = false;

    if (isLoggedIn && orders?.orders) {
        hasPurchased = orders.orders.some((order) => order.order_items.some((item) => item.variant.product_id === product_id));
    }

    if (reviews?.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <ProductReviewsZeroState productName={productName} product_id={product_id} />
            </div>
        );
    }

    const ratingDistribution: RatingDistribution[] = Array.from({ length: 5 }, (_, index) => ({
        stars: 5 - index,
        percentage: 0,
    }));

    let totalRating = 0;
    const totalReviews = reviews?.length || 0;

    reviews?.forEach((review: Review) => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingDistribution[5 - review.rating].percentage += 1;
            totalRating += review.rating;
        }
    });

    ratingDistribution.forEach((rating: RatingDistribution) => {
        rating.percentage = Math.round((rating.percentage / totalReviews) * 100);
    });

    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "N/A";

    const RatingBreakdown = () => (
        <div className="py-4 rounded-lg mb-4">
            <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                    <span className="text-3xl font-bold mr-2">{averageRating}</span>
                    <div className="flex">
                        {[...Array(5)].map((_, index: number) => (
                            <Star key={index} className={`h-5 w-5 ${index < 4 ? "text-yellow-400 fill-yellow-300" : "text-gray-300"}`} />
                        ))}
                    </div>
                </div>
                <span className="text-sm text-default-500">{totalReviews} reviews</span>
            </div>

            <div className="space-y-1">
                {ratingDistribution.map((rating: { stars: number; percentage: number }, index: number) => (
                    <div key={index} className="flex items-center">
                        <span className="mr-2 text-sm w-6">{rating.stars}★</span>
                        <Progress className="flex-1 h-2" value={rating.percentage} />
                        <span className="ml-2 text-sm text-default-500 w-10">{rating.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const ReviewCard = ({ review }: { review: Review }) => (
        <div className="bg-content2 px-6 py-4 rounded-lg mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center">
                        <span className="font-semibold mr-2">{review?.user?.first_name}</span>
                        {review.verified && <Badge variant="success">Verified</Badge>}
                    </div>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                        ))}
                        <span className="text-xs text-default-500 ml-2">{timeAgo(review.created_at)}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-default-500 mb-2">{review.comment}</p>
        </div>
    );

    return (
        <div className="bg-content1">
            <div className="px-4 py-8 max-w-7xl mx-auto w-full">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Customer Reviews <Badge variant="emerald">All from verified purchases</Badge>
                </h2>
                <RatingBreakdown />
                <div className="mb-8">{reviews?.slice(0, 5).map((review: Review, index: number) => <ReviewCard key={index} review={review} />)}</div>
                {isLoggedIn ? (
                    hasPurchased ? (
                        hasReviewed ? (
                            <p className="text-default-500">You have already reviewed this product.</p>
                        ) : (
                            <CreateReviewForm product_id={product_id} />
                        )
                    ) : (
                        <p className="text-default-500">You can only review products you have purchased.</p>
                    )
                ) : (
                    <p className="text-default-500">Please log in to leave a review.</p>
                )}
                {/* <Button className="mt-4" endContent={<ChevronDown className="ml-2 h-4 w-4" viewBox="0 0 20 20" />}>
                Load More Reviews
            </Button> */}
            </div>
        </div>
    );
};

export default ReviewsSection;
