"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Pencil, Trash2 } from "lucide-react";

import { UpdateReviewForm } from "./reviews-form";

import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Review } from "@/schemas";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { useDeleteReview, useUpdateReview } from "@/lib/hooks/useReview";

interface Props {
    review: Review;
}

const ReviewActions: React.FC<Props> = ({ review }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const { mutate: updateReview, isPending } = useUpdateReview();
    const { mutateAsync: deleteReview } = useDeleteReview();

    const onConfirmDelete = async () => {
        deleteReview(review.id).then(() => {
            deleteState.close();
        });
    };

    const handlePublish = async (publish: boolean) => {
        updateReview({ id: review.id, input: { verified: publish } });
    };

    return (
        <div className="relative flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                title="Edit Review"
                trigger={
                    <Button size="iconOnly" onClick={editState.open}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <UpdateReviewForm review={review} onClose={editState.close} />
            </Overlay>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="h-5 w-5 text-danger" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
            {review.verified ? (
                <Button
                    aria-label="unpublish"
                    className="min-w-32"
                    disabled={isPending}
                    isLoading={isPending}
                    variant="emerald"
                    onClick={() => handlePublish(false)}
                >
                    Un-publish
                </Button>
            ) : (
                <Button
                    aria-label="publish"
                    className="min-w-32"
                    disabled={isPending}
                    isLoading={isPending}
                    variant="outline"
                    onClick={() => handlePublish(true)}
                >
                    Publish
                </Button>
            )}
        </div>
    );
};

export { ReviewActions };
