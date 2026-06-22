import { Star } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import { useRouteContext } from "@tanstack/react-router";
import SheetDrawer from "@/components/sheet-drawer";
import { UserDropdown } from "@/components/user-button";
import EmptyState from "@/components/generic/empty";

interface ProductReviewsZeroStateProps {
    productName: string;
    product_id: number;
}

export const ProductReviewsZeroState = ({ productName, product_id }: ProductReviewsZeroStateProps) => {
    const { isAuthenticated } = useRouteContext({ strict: false });
    const state = useOverlayTriggerState({});

    return (
        <EmptyState
            icon={Star}
            title="No reviews yet"
            description={`Be the first to share your experience with ${productName}. Your review helps other customers decide.`}
            action={
                isAuthenticated ? (
                    <SheetDrawer
                        open={state.isOpen}
                        title={`Write a review for ${productName}`}
                        trigger={<Button className="rounded-full px-6 mx-auto">Write the first review</Button>}
                        onOpenChange={state.setOpen}
                    >
                        <ReviewForm product_id={product_id} onClose={state.close} />
                    </SheetDrawer>
                ) : (
                    <UserDropdown />
                )
            }
        />
    );
};