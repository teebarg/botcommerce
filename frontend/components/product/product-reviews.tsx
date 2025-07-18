"use client";

import React from "react";

import { ProductReviewsZeroState } from "../store/reviews/review-zero";

import ComponentLoader from "@/components/component-loader";
import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/lib/hooks/useOrder";
import { ReviewsList } from "../store/reviews/reviews-list";
import { useReviews } from "@/lib/hooks/useReview";
import { useSearchParams } from "next/navigation";

interface Prop {
    product_id: number;
    productName: string;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName }) => {
    const searchParams = useSearchParams();
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const { data, isLoading } = useReviews({ product_id, skip, limit: 5 });
    const { user, loading: userLoading } = useAuth();
    const { data: orders, isLoading: ordersLoading } = useOrders({});

    if (isLoading || userLoading || ordersLoading) {
        return <ComponentLoader className="min-h-[400px]" />;
    }

    const isLoggedIn = !!user;
    const hasReviewed = isLoggedIn && data?.reviews?.some((r) => r.user?.id === user?.id);
    let hasPurchased = false;

    if (isLoggedIn && orders?.orders) {
        hasPurchased = orders.orders.some((order) => order.order_items.some((item) => item.variant.product_id === product_id));
    }

    if (data?.reviews?.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <p className="text-default-700 mt-2 mb-6 text-center font-semibold">Customer Reviews & Ratings</p>
                <ProductReviewsZeroState productName={productName} product_id={product_id} />
            </div>
        );
    }

    return <ReviewsList data={data!} productName={productName} product_id={product_id} hasPurchased={hasPurchased} hasReviewed={hasReviewed} />;
};

export default ReviewsSection;
