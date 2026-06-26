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
        deleteReview(review.id).then(() => deleteState.close());
    };

    const handlePublish = async (publish: boolean) => {
        updateReview({ id: review.id, input: { verified: publish } });
    };

    return (
        <div className="flex items-center gap-1.5">
            <SheetDrawer
                open={editState.isOpen}
                title="Edit Review"
                trigger={
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-foreground hover:bg-muted"
                        onClick={editState.open}
                    >
                        <Pencil className="h-4 w-4" />
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
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={onConfirmDelete}
                title="Delete review"
                description="Are you sure you want to delete this review? This action cannot be undone."
                isLoading={deletePending}
            />

            {review.verified ? (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    isLoading={isPending}
                    onClick={() => handlePublish(false)}
                >
                    Unpublish
                </Button>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    isLoading={isPending}
                    onClick={() => handlePublish(true)}
                >
                    Publish
                </Button>
            )}
        </div>
    );
};

export { ReviewActions };