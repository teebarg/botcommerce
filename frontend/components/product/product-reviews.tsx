import React from "react";
import { Star } from "nui-react-icons";

import Progress from "@/components/ui/progress";
import Chip from "@/components/ui/chip";
import { Product } from "@/types/global";
import { getProductReviews } from "@/lib/data";
import { BtnLink } from "@/components/ui/btnLink";

interface Prop {
    product: Product;
}

const ReviewsSection: React.FC<Prop> = async ({ product }) => {
    const { reviews } = await getProductReviews(product.id);

    if (!reviews) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg p-6 text-center">
                {/* Decorative elements */}
                <div className="relative mb-6">
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                        {/* <MessageSquare className="w-12 h-12 text-blue-500" /> */}
                    </div>
                    <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {/* <PencilLine className="w-5 h-5 text-blue-600" /> */}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-6 max-w-sm">
                    Be the first to share your experience with this product and help others make informed decisions!
                </p>

                <BtnLink href="">Write a Review</BtnLink>

                {/* Decorative patterns */}
                <div className="absolute top-10 left-10 w-4 h-4 border-2 border-blue-200 rounded-full opacity-20" />
                <div className="absolute bottom-10 right-10 w-6 h-6 border-2 border-blue-200 rounded-full opacity-20" />
                <div className="absolute top-1/2 right-20 w-3 h-3 bg-blue-100 rounded-full opacity-30" />
                <div className="absolute bottom-1/4 left-16 w-3 h-3 bg-blue-100 rounded-full opacity-30" />
            </div>
        );
    }

    interface ReviewData {
        id: number;
        name: string;
        rating: number;
        created_at: string;
        verified: boolean;
        comment: string;
    }

    const ratingDistribution = [
        { stars: 5, percentage: 75 },
        { stars: 4, percentage: 20 },
        { stars: 3, percentage: 3 },
        { stars: 2, percentage: 1 },
        { stars: 1, percentage: 1 },
    ];

    const RatingBreakdown = () => (
        <div className="bg-content1 p-6 rounded-lg mb-4">
            <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                    <span className="text-3xl font-bold mr-2">4.7</span>
                    <div className="flex">
                        {[...Array(5)].map((_, index: number) => (
                            <Star key={index} className={`h-5 w-5 ${index < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                        ))}
                    </div>
                </div>
                <span className="text-sm text-default-600">128 reviews</span>
            </div>

            <div className="space-y-1">
                {ratingDistribution.map((rating: { stars: number; percentage: number }, index: number) => (
                    <div key={index} className="flex items-center">
                        <span className="mr-2 text-sm w-6">{rating.stars}★</span>
                        <Progress className="flex-1 h-2" value={rating.percentage} />
                        <span className="ml-2 text-sm text-default-600 w-10">{rating.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const ReviewCard = ({ review }: { review: ReviewData }) => (
        <div className="bg-content1 p-6 rounded-lg mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center">
                        <span className="font-semibold mr-2">{review.name}</span>
                        {review.verified && <Chip color="success" title="Verified" />}
                    </div>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                        ))}
                        <span className="text-xs text-default-500 ml-2">{review.created_at}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-default-700 mb-2">{review.comment}</p>
        </div>
    );

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Customer Reviews <Chip color="success" title="All from verified purchases" />
            </h2>
            <RatingBreakdown />
            <div>{reviews?.map((review: ReviewData, index: number) => <ReviewCard key={index} review={review} />)}</div>

            {/* <Button className="mt-4" endContent={<ChevronDown className="ml-2 h-4 w-4" viewBox="0 0 20 20" />}>
                Load More Reviews
            </Button> */}
        </div>
    );
};

export default ReviewsSection;
