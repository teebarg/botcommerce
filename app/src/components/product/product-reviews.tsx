import React from "react";

import { ProductReviewsZeroState } from "../store/reviews/review-zero";
import { ReviewsList } from "../store/reviews/reviews-list";

import ComponentLoader from "@/components/component-loader";
import { useOrders, useOrders2 } from "@/hooks/useOrder";
// import { useReviews } from "@/hooks/useReview";
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
    // const session: any = null;
    const routeApi = getRouteApi("/_mainLayout/products/$slug");
    // const searchParams: any = null;
    // const skip = parseInt(searchParams.get("skip") || "0", 10);
    // const sort = searchParams.get("sort") || "newest";

    // const { data, isLoading } = useReviews({ product_id, limit: 5 });
    // const { data: orders, isLoading: ordersLoading } = useOrders2({});
    const { data: orders } = useSuspenseQuery(useOrders({}));

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
