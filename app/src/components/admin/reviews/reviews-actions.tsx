import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Pencil, Trash2 } from "lucide-react";
import { UpdateReviewForm } from "./reviews-form";
import type { Review } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useDeleteReview, useUpdateReview } from "@/hooks/useReview";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import SheetDrawer from "@/components/sheet-drawer";

interface Props {
    review: Review;
}

const ReviewActions: React.FC<Props> = ({ review }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const { mutate: updateReview, isPending } = useUpdateReview();
    const { mutateAsync: deleteReview, isPending: deletePending } = useDeleteReview();

    const onConfirmDelete = async () => {
        deleteReview(review.id).then(() => {
            deleteState.close();
        });
    };

    const handlePublish = async (publish: boolean) => {
        updateReview({ id: review.id, input: { verified: publish } });
    };

    return (
        <div className="relative flex items-center">
            <SheetDrawer
                open={editState.isOpen}
                title="Edit Review"
                trigger={
                    <Button size="icon" onClick={editState.open}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <UpdateReviewForm review={review} onClose={editState.close} />
            </SheetDrawer>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button size="icon" variant="ghost">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onConfirmDelete}
                title="Delete"
                confirmText="Delete"
                isLoading={deletePending}
            />
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
