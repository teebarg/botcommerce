"use client";

import { Star } from "lucide-react";

export interface Review {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
}

interface ReviewItemProps {
    review: Review;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        stars.push(<Star key={i} className={i <= review.rating ? "fill-warning text-warning" : "text-gray-300"} size={16} />);
    }

    return (
        <div className="border-b border-gray-200 py-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-medium text-gray-900">{review.customerName}</div>
                    <div className="flex items-center">
                        <div className="flex mr-2">{stars}</div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                </div>
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
        </div>
    );
};

export default ReviewItem;
