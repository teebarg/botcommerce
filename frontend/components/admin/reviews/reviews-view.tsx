"use client";

import React from "react";
import { ArrowUpDown, Search } from "nui-react-icons";

import { ReviewActions } from "./reviews-actions";
import ReviewItem from "./review-item";

import { Pagination, Review } from "@/types/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/util/util";
import PaginationUI from "@/components/pagination";

interface Props {
    reviews: Review[];
    deleteAction: (id: number) => void;
    pagination: Pagination;
}

const ReviewView: React.FC<Props> = ({ reviews, deleteAction, pagination }) => {
    return (
        <div className="px-2 md:px-12 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reviews</h1>
                    <p className="text-muted-foreground">Manage your product reviews</p>
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
                                    <Badge variant={review.verified ? "success" : "destructive"}>
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
                                <TableCell className="text-center py-4 text-lg text-default-500" colSpan={5}>
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
