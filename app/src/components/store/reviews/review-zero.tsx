import { MessageSquare, Star, Users, Package } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { ReviewForm } from "./review-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Overlay from "@/components/overlay";
import { BtnLink } from "@/components/ui/btnLink";
import { useLocation } from "@tanstack/react-router";

interface ProductReviewsZeroStateProps {
    onWriteReview?: () => void;
    productName: string;
    product_id: number;
}

export const ProductReviewsZeroState = ({ productName, product_id }: ProductReviewsZeroStateProps) => {
    const session: any = null;
    const state = useOverlayTriggerState({});
    const location = useLocation()
    const pathname = location.pathname

    return (
        <Card className="w-full max-w-6xl mx-auto text-center border-dashed border-2">
            <div className="space-y-6 mb-4 px-2">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-linear-to-br from-primary/5 via-accent/10 to-secondary/5 flex items-center justify-center">
                    <div className="relative z-10 text-center space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                            <Package className="w-10 h-10 text-primary/60" />
                        </div>
                        <div className="flex justify-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-muted-foreground/30" fill="none" />
                            ))}
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent" />
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">No reviews yet</h3>

                    <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                        Be the first to share your experience with {productName}. Your review helps other customers make informed decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                    <div className="flex flex-col items-center space-y-2 p-4 bg-secondary rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Rate & Review</span>
                        <span className="text-xs text-muted-foreground text-center">Share your honest opinion</span>
                    </div>

                    <div className="flex flex-col items-center space-y-2 p-4 bg-secondary rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Add Photos</span>
                        <span className="text-xs text-muted-foreground text-center">Show the product in action</span>
                    </div>

                    <div className="flex flex-col items-center space-y-2 p-4 bg-secondary rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Help Others</span>
                        <span className="text-xs text-muted-foreground text-center">Guide future customers</span>
                    </div>
                </div>

                {session?.user ? (
                    <div className="space-y-3">
                        <Overlay
                            open={state.isOpen}
                            sheetClassName="min-w-120"
                            title="Write the First Review"
                            trigger={<Button className="w-full md:w-auto px-8">Write the First Review</Button>}
                            onOpenChange={state.setOpen}
                        >
                            <ReviewForm productName={productName} product_id={product_id} onClose={state.close} />
                        </Overlay>

                        <p className="text-xs text-muted-foreground">Takes less than 2 minutes</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <BtnLink className="w-full md:w-auto px-8" href={`/auth/signin?callbackUrl=${pathname}`} size="lg">
                            Login to Write a Review
                        </BtnLink>
                    </div>
                )}
            </div>
        </Card>
    );
};
