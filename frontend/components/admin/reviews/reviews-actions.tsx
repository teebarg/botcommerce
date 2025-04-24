"use client";

import { Confirm } from "@modules/common/components/confirm";
import { Edit } from "nui-react-icons";
import React, { useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { ReviewForm } from "./reviews-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DrawerUI from "@/components/drawer";
import { Review } from "@/types/models";
import { Button } from "@/components/ui/button";
import { publishReview } from "@/actions/reviews";

interface Props {
    review: Review;
    deleteAction: (id: number) => void;
}

const ReviewActions: React.FC<Props> = ({ review, deleteAction }) => {
    const editState = useOverlayTriggerState({});
    const state = useOverlayTriggerState({});
    const router = useRouter();
    const [publishing, setPublishing] = useState<boolean>(false);

    const onConfirmDelete = async () => {
        try {
            await deleteAction(review.id);
            router.refresh();
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

            router.refresh();
            toast.success("Review published successfully");
        } catch (error) {
            toast.error("Error publishing review");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <DrawerUI open={editState.isOpen} title="Edit Review" trigger={<Edit className="h-5 w-5" />} onOpenChange={editState.setOpen}>
                <div className="max-w-2xl">
                    <ReviewForm review={review} onClose={editState.close} />
                </div>
            </DrawerUI>
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
                    variant="default"
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
