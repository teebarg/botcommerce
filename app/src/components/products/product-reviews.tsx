import type React from "react";
import { ProductReviewsZeroState } from "../store/reviews/review-zero";
import { ReviewsList } from "../store/reviews/reviews-list";
import type { PaginatedOrder, PaginatedReview } from "@/schemas";
import { useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";

interface Prop {
    product_id: number;
    productName: string;
}

const ReviewsSection: React.FC<Prop> = ({ product_id, productName }) => {
    const { session } = useRouteContext({ strict: false });
    const { data: reviewsData } = useQuery({
        queryKey: ["reviews", product_id],
        queryFn: async () => await clientApi.get<PaginatedReview>("/reviews/", { params: { product_id, limit: 5 } }),
    });
    const { data } = useQuery({
        queryKey: ["orders", JSON.stringify({})],
        queryFn: async () => await clientApi.get<PaginatedOrder>("/order/", { accessToken: session?.accessToken }),
    });
    const hasReviewed = session && reviewsData?.reviews?.some((r) => r.user?.id === session?.id);
    let hasPurchased = false;

    if (session && data?.orders) {
        hasPurchased = data.orders.some((order) => order.order_items.some((item) => item.variant?.product_id === product_id));
    }

    if (reviewsData?.reviews?.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <p className="mt-2 mb-6 text-center font-semibold">Customer Reviews & Ratings</p>
                <ProductReviewsZeroState productName={productName} product_id={product_id} />
            </div>
        );
    }

    if (!reviewsData) {
        return null;
    }

    return <ReviewsList data={reviewsData} hasPurchased={hasPurchased} hasReviewed={hasReviewed} product_id={product_id} />;
};

export default ReviewsSection;
