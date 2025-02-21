import { Metadata } from "next";
import { Review } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import { getProductReviews } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { deleteReview } from "@modules/admin/actions";

import { siteConfig } from "@/lib/config";
import Chip from "@/components/ui/chip";
import { ReviewForm } from "@/modules/admin/reviews/reviews-form";
import { timeAgo } from "@/lib/util/util";

export const metadata: Metadata = {
    title: `Reviews Page | Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

type SearchParams = Promise<{
    page?: string;
    limit?: string;
}>;

export default async function ReviewsPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const { reviews, ...pagination } = await getProductReviews(undefined, page, limit);

    return (
        <React.Fragment>
            <div className="h-full">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-2xl font-semibold mb-8">Reviews</h1>
                    <Table
                        canAdd={false}
                        canSearch={false}
                        columns={["S/N", "Comment", "Rating", "Status", "Created At", "Actions"]}
                        pagination={pagination}
                    >
                        {reviews?.map((item: Review, index: number) => (
                            <tr key={item.id} className="even:bg-content2">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{(page - 1) * limit + index + 1}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <div className="font-bold truncate w-60">{item?.comment}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <div className="font-bold truncate w-8">{item?.rating}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <Chip color={item.verified ? "success" : "danger"} title={item.verified ? "verified" : "un-verified"} />
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{timeAgo(item.created_at)}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                    <Actions
                                        deleteAction={deleteReview}
                                        form={<ReviewForm current={item} />}
                                        item={item}
                                        label="review"
                                        showDetails={false}
                                    />
                                </td>
                            </tr>
                        ))}
                        {reviews?.length === 0 && (
                            <tr>
                                <td className="text-center py-4 text-lg text-default-500" colSpan={5}>
                                    No Reviews found.
                                </td>
                            </tr>
                        )}
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );
}
