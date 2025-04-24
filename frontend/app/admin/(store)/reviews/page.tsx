import { Metadata } from "next";
import React from "react";

import { api } from "@/apis";
import ClientOnly from "@/components/generic/client-only";
import ReviewView from "@/components/admin/reviews/reviews-view";
import ServerError from "@/components/server-error";

export const metadata: Metadata = {
    title: "Reviews",
};

type SearchParams = Promise<{
    page?: string;
    limit?: string;
}>;

export default async function ReviewsPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const { data, error } = await api.review.all({ page, limit });

    if (error || !data) {
        return <ServerError />;
    }

    const deleteReview = async (id: number) => {
        "use server";
        await api.review.delete(id);
    };

    const { reviews, ...pagination } = data;

    return (
        <ClientOnly>
            <ReviewView deleteAction={deleteReview} pagination={pagination} reviews={reviews} />
        </ClientOnly>
    );
}
