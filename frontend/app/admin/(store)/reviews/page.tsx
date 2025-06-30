import { Metadata } from "next";
import React from "react";

import { api } from "@/apis";
import ReviewView from "@/components/admin/reviews/reviews-view";

export const metadata: Metadata = {
    title: "Reviews",
};

export default async function ReviewsPage() {
    const deleteReview = async (id: number) => {
        "use server";
        await api.review.delete(id);
    };

    return <ReviewView deleteAction={deleteReview} />;
}
