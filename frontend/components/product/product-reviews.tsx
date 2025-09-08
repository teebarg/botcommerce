"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { ProductReviewsZeroState } from "../store/reviews/review-zero";
import { ReviewsList } from "../store/reviews/reviews-list";

import ComponentLoader from "@/components/component-loader";
import { useOrders } from "@/lib/hooks/useOrder";
import { useReviews } from "@/lib/hooks/useReview";

interface Prop {
    product_id: number;
    productName: string;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName }) => {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const sort = searchParams.get("sort") || "newest";

    const { data, isLoading } = useReviews({ product_id, skip, limit: 5, sort });
    const { data: orders, isLoading: ordersLoading } = useOrders({});

    if (isLoading || ordersLoading) {
        return <ComponentLoader className="min-h-[400px]" />;
    }

    const isLoggedIn = !!session?.user;
    const hasReviewed = isLoggedIn && data?.reviews?.some((r) => r.user?.id === session?.id);
    let hasPurchased = false;

    if (isLoggedIn && orders?.orders) {
        hasPurchased = orders.orders.some((order) => order.order_items.some((item) => item.variant?.product_id === product_id));
    }

    if (data?.reviews?.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <p className="text-default-700 mt-2 mb-6 text-center font-semibold">Customer Reviews & Ratings</p>
                <ProductReviewsZeroState productName={productName} product_id={product_id} />
            </div>
        );
    }

    return <ReviewsList data={data!} hasPurchased={hasPurchased} hasReviewed={hasReviewed} productName={productName} product_id={product_id} />;
};

export default ReviewsSection;
