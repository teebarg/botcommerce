import React from "react";

import { ProductReviewsZeroState } from "../store/reviews/review-zero";
import { ReviewsList } from "../store/reviews/reviews-list";
import { ordersQueryOptions } from "@/hooks/useOrder";
import { PaginatedReview } from "@/schemas";
import { getRouteApi } from "@tanstack/react-router";
import { Session } from "start-authjs";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Prop {
    product_id: number;
    productName: string;
    paginatedReviews: PaginatedReview;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName, paginatedReviews }) => {
    const routeApi = getRouteApi("/_mainLayout/products/$slug");
    const { data: orders } = useSuspenseQuery(ordersQueryOptions({}));

    const context = routeApi.useRouteContext();
    const session = context.session as unknown as Session;
    const hasReviewed = session && paginatedReviews?.reviews?.some((r) => r.user?.id === session?.id);
    let hasPurchased = false;

    if (session && orders?.orders) {
        hasPurchased = orders.orders.some((order) => order.order_items.some((item) => item.variant?.product_id === product_id));
    }

    if (paginatedReviews?.reviews?.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <p className="mt-2 mb-6 text-center font-semibold">Customer Reviews & Ratings</p>
                <ProductReviewsZeroState productName={productName} product_id={product_id} />
            </div>
        );
    }

    return (
        <ReviewsList
            data={paginatedReviews!}
            hasPurchased={hasPurchased}
            hasReviewed={hasReviewed}
            productName={productName}
            product_id={product_id}
        />
    );
};

export default ReviewsSection;
