"use client";

import React, { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { ReviewForm } from "./reviews-form";

import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Review } from "@/types/models";
import { Button } from "@/components/ui/button";
import { publishReview } from "@/actions/reviews";
import Overlay from "@/components/overlay";
import { useInvalidate } from "@/lib/hooks/useApi";

interface Props {
    review: Review;
    deleteAction: (id: number) => void;
}

const ReviewActions: React.FC<Props> = ({ review, deleteAction }) => {
    const editState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const [publishing, setPublishing] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const onConfirmDelete = async () => {
        try {
            await deleteAction(review.id);
            invalidate("reviews");
            toast.success("Review deleted successfully");
            state.close();
        } catch (error) {
            toast.error("Error deleting review");
        }
    };

    const handlePublish = async (publish: boolean) => {
        try {
            setPublishing(true);
            const res = await publishReview(review.id, publish);

            if (res.error) {
                toast.error(res.error);

                return;
            }

            invalidate("reviews");
            toast.success("Review published successfully");
        } catch (error) {
            toast.error("Error publishing review");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <Overlay
                open={editState.isOpen}
                title="Edit Review"
                trigger={
                    <Button size="iconOnly" variant="ghost" onClick={editState.open}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <ReviewForm review={review} onClose={editState.close} />
            </Overlay>
            <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                <DialogTrigger>
                    <Trash2 className="h-5 w-5 text-danger" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="sr-only">Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={state.close} onConfirm={onConfirmDelete} />
                </DialogContent>
            </Dialog>
            {review.verified ? (
                <Button
                    aria-label="unpublish"
                    className="min-w-32"
                    disabled={publishing}
                    isLoading={publishing}
                    variant="emerald"
                    onClick={() => handlePublish(false)}
                >
                    Un-publish
                </Button>
            ) : (
                <Button
                    aria-label="publish"
                    className="min-w-32"
                    disabled={publishing}
                    isLoading={publishing}
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
