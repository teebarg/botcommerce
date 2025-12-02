import { Metadata } from "next";
import React from "react";

import ReviewView from "@/components/admin/reviews/reviews-view";

export const metadata: Metadata = {
    title: "Reviews",
};

export default async function ReviewsPage() {
    return <ReviewView />;
}
