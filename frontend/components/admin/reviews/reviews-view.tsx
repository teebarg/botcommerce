"use client";

import React from "react";
import { ArrowUpDown, Search } from "nui-react-icons";
import { useSearchParams } from "next/navigation";

import { ReviewActions } from "./reviews-actions";
import ReviewItem from "./review-item";

import { Review } from "@/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import PaginationUI from "@/components/pagination";
import { useReviews } from "@/lib/hooks/useApi";
import ServerError from "@/components/generic/server-error";
import { Skeleton } from "@/components/ui/skeletons";

interface Props {
    deleteAction: (id: number) => void;
}

const ReviewView: React.FC<Props> = ({ deleteAction }) => {
    const searchParams = useSearchParams();
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const { data, isLoading, error } = useReviews({ skip, limit });

    if (isLoading) {
        return <Skeleton />;
    }

    if (error || !data) {
        return <ServerError />;
    }

    const { reviews, ...pagination } = data;

    return (
        <div className="px-2 md:px-12 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Reviews</h1>
                    <p className="text-default-500 text-sm">Manage your product reviews</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Input className="w-full" placeholder="Search reviews..." startContent={<Search />} type="search" />
                    </div>
                </div>
            </div>
            <div className="md:block hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                    Created At
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews?.map((review: Review, idx: number) => (
                            <TableRow key={idx} className="even:bg-content1">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="flex-1">
                                    <div className="font-bold truncate min-w-72">{review?.comment}</div>
                                </TableCell>
                                <TableCell>
                                    <div>{review?.rating}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={review.verified ? "emerald" : "destructive"}>
                                        {review.verified ? "Verified" : "Un-verified"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{timeAgo(review.created_at)}</TableCell>
                                <TableCell className="flex justify-end">
                                    <ReviewActions deleteAction={deleteAction} review={review} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {reviews?.length === 0 && (
                            <TableRow>
                                <TableCell className="text-center py-4 text-default-500" colSpan={5}>
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="md:hidden">
                <div>
                    <div className="flex flex-col gap-3">
                        {reviews?.map((review: Review, idx: number) => <ReviewItem key={idx} deleteAction={deleteAction} review={review} />)}
                    </div>

                    {reviews?.length === 0 && (
                        <div className="text-center py-8 bg-content1 rounded-lg mt-3">
                            <p className="text-default-500">No reviews found</p>
                        </div>
                    )}
                </div>
            </div>
            {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
        </div>
    );
};

export default ReviewView;
