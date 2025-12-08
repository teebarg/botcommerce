import type React from "react";
import { ProductReviewsZeroState } from "../store/reviews/review-zero";
import { ReviewsList } from "../store/reviews/reviews-list";
import { ordersQueryOptions } from "@/hooks/useOrder";
import type { PaginatedReview } from "@/schemas";
import { useRouteContext } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Prop {
    product_id: number;
    productName: string;
    paginatedReviews: PaginatedReview;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName, paginatedReviews }) => {
    const { session } = useRouteContext({ strict: false });
    const { data: orders } = useSuspenseQuery(ordersQueryOptions({}));
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
