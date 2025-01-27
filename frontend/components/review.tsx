"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Star, ThumbsDownIcon, ThumbsUpIcon } from "nui-react-icons";
import Progress from "@/components/ui/progress";
import Chip from "@/components/ui/chip";

const ReviewsSection: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<string>("recent");

    interface ReviewData {
        id: number;
        name: string;
        rating: number;
        date: string;
        verified: boolean;
        text: string;
        likes: number;
        dislikes: number;
    }

    const reviewData: ReviewData[] = [
        {
            id: 1,
            name: "Sarah M.",
            rating: 5,
            date: "2 weeks ago",
            verified: true,
            text: "Absolutely love this product! High quality and exceeded my expectations.",
            likes: 24,
            dislikes: 2,
        },
        {
            id: 2,
            name: "Michael K.",
            rating: 4,
            date: "1 month ago",
            verified: true,
            text: "Great product, slight delay in shipping but overall very satisfied.",
            likes: 12,
            dislikes: 1,
        },
        {
            id: 3,
            name: "Emma L.",
            rating: 5,
            date: "3 weeks ago",
            verified: true,
            text: "Perfect fit and amazing quality. Will definitely buy again!",
            likes: 18,
            dislikes: 0,
        },
    ];

    const ratingDistribution = [
        { stars: 5, percentage: 75 },
        { stars: 4, percentage: 20 },
        { stars: 3, percentage: 3 },
        { stars: 2, percentage: 1 },
        { stars: 1, percentage: 1 },
    ];

    const ReviewFilter = () => (
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
            {["recent", "top", "verified"].map((filter: string, index: number) => (
                <Chip
                    size="lg"
                    key={index}
                    color={selectedFilter === filter ? "default" : "secondary"}
                    onClick={() => setSelectedFilter(filter)}
                    className="py-1 px-3 cursor-pointer capitalize"
                >
                    {filter}
                </Chip>
            ))}
            <Button size="sm" className="ml-2 h-8">
                filter
                {/* <Filter className="h-4 w-4" /> */}
            </Button>
        </div>
    );

    const RatingBreakdown = () => (
        <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                    <span className="text-3xl font-bold mr-2">4.7</span>
                    <div className="flex">
                        {[...Array(5)].map((_, index: number) => (
                            <Star key={index} className={`h-5 w-5 ${index < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                        ))}
                    </div>
                </div>
                <span className="text-sm text-gray-600">128 reviews</span>
            </div>

            <div className="space-y-1">
                {ratingDistribution.map((rating: { stars: number; percentage: number }, index: number) => (
                    <div key={index} className="flex items-center">
                        <span className="mr-2 text-sm w-6">{rating.stars}★</span>
                        <Progress value={rating.percentage} className="flex-1 h-2" />
                        <span className="ml-2 text-sm text-gray-600 w-10">{rating.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const ReviewCard = ({ review }: { review: ReviewData }) => (
        <div className="bg-white p-4 rounded-lg mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center">
                        <span className="font-medium mr-2">{review.name}</span>
                        {review.verified && <Chip color="success">Verified</Chip>}
                    </div>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">{review.date}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-700 mb-2">{review.text}</p>
            <div className="flex items-center text-sm text-gray-600">
                <span className="mr-4 flex items-center">
                    <ThumbsUpIcon className="h-4 w-4 mr-1" /> {review.likes}
                </span>
                <span className="flex items-center">
                    <ThumbsDownIcon className="h-4 w-4 mr-1" /> {review.dislikes}
                </span>
            </div>
        </div>
    );

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

            <RatingBreakdown />

            <ReviewFilter />

            <div>
                {reviewData.map((review: ReviewData, index: number) => (
                    <ReviewCard key={index} review={review} />
                ))}
            </div>

            <Button className="mt-4" endContent={<ChevronDown className="ml-2 h-4 w-4" viewBox="0 0 20 20" />}>
                Load More Reviews
            </Button>
        </div>
    );
};

export default ReviewsSection;
