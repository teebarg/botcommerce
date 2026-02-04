import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Trash2, Power, PowerOff, Copy } from "lucide-react";
import { AssignmentDialog } from "./assignment-dialog";
import { CouponUsageDialog } from "./coupon-usage-dialog";
import { EditCouponDialog } from "./edit-coupon-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Coupon } from "@/schemas/common";
import { cn, currency, formatDate } from "@/utils";
import { useOverlayTriggerState } from "react-stately";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface SwipeableCouponCardProps {
    coupon: Coupon;
    onCopy: (code: string) => void;
    onToggleStatus: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number, code: string) => void;
}

export const SwipeableCouponCard = ({ coupon, onCopy, onToggleStatus, onDelete }: SwipeableCouponCardProps) => {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const deleteState = useOverlayTriggerState({});

    const SWIPE_THRESHOLD = -150; // Pixels to swipe before triggering delete

    const handlers = useSwipeable({
        onSwiping: (eventData) => {
            // Only allow left swipes and only on mobile
            if (window.innerWidth < 768 && eventData.deltaX < 0) {
                setIsSwiping(true);
                setSwipeOffset(Math.max(eventData.deltaX, -150));
            }
        },
        onSwiped: (eventData) => {
            setIsSwiping(false);
            if (eventData.deltaX < SWIPE_THRESHOLD) {
                onDelete(coupon.id, coupon.code);
                setSwipeOffset(0);
            } else {
                setSwipeOffset(0);
            }
        },
        trackMouse: false,
        trackTouch: true,
        delta: 10,
        preventScrollOnSwipe: false,
    });

    const deleteOpacity = Math.min(Math.abs(swipeOffset) / 100, 1);
    const showDeleteButton = swipeOffset < -50;

    return (
        <div className="relative overflow-hidden rounded-lg">
            {/* Delete Background (visible when swiping) */}
            <div
                className="absolute inset-0 bg-destructive flex items-center justify-end px-6 rounded-lg transition-opacity"
                style={{ opacity: deleteOpacity }}
            >
                <div className="flex items-center gap-2 text-destructive-foreground">
                    <Trash2 className="h-5 w-5" />
                    {showDeleteButton && <span className="font-medium">Delete</span>}
                </div>
            </div>

            <div
                {...handlers}
                className="relative bg-background"
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: isSwiping ? "none" : "transform 0.3s ease-out",
                }}
            >
                <Card className={cn("border-border", isSwiping && "cursor-grabbing")}>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="text-lg md:text-xl font-semibold">{coupon.code}</CardTitle>
                                <Badge variant={coupon.is_active ? "emerald" : "destructive"}>{coupon.is_active ? "Active" : "Inactive"}</Badge>
                                {coupon.scope === "SPECIFIC_USERS" && <Badge variant="warning">VIP Only</Badge>}
                            </div>
                            <div className="flex gap-2 self-start sm:self-auto">
                                <Button className="h-9 w-9" size="icon" variant="ghost" onClick={() => onCopy(coupon.code)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <EditCouponDialog coupon={coupon} />
                                <Button className="h-9 w-9" size="icon" variant="ghost" onClick={() => onToggleStatus(coupon.id, coupon.is_active)}>
                                    {coupon.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                </Button>
                                <ConfirmDrawer
                                    open={deleteState.isOpen}
                                    onOpenChange={deleteState.setOpen}
                                    trigger={
                                        <Button className="h-9 w-9" size="icon" variant="ghost">
                                            <Trash2 className="text-red-500 h-4 w-4 cursor-pointer" />
                                        </Button>
                                    }
                                    onClose={deleteState.close}
                                    onConfirm={() => onDelete(coupon.id, coupon.code)}
                                    title="Delete"
                                    confirmText="Delete"
                                    variant="destructive"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    {coupon.scope === "SPECIFIC_USERS" && (
                        <CardContent className="pb-3 pt-0">
                            <AssignmentDialog assignedUsers={coupon.users ?? []} couponCode={coupon.code} couponId={coupon.id} />
                        </CardContent>
                    )}
                    <CardContent className="space-y-3">
                        {coupon.scope === "SPECIFIC_USERS" ? "" : " "}
                        <div className="flex items-center justify-between pb-3 border-b">
                            <CouponUsageDialog couponCode={coupon.code} couponType={coupon.discount_type} usageHistory={coupon.usages || []} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Discount</p>
                                <p className="font-medium">
                                    {coupon.discount_type === "PERCENTAGE" ? `${coupon.discount_value}%` : currency(coupon.discount_value)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Usage</p>
                                <p className="font-medium">
                                    {coupon.current_uses || 0} / {coupon.max_uses}
                                </p>
                            </div>
                            {coupon.min_cart_value && (
                                <div>
                                    <p className="text-muted-foreground">Min Cart Value</p>
                                    <p className="font-medium">{currency(coupon.min_cart_value)}</p>
                                </div>
                            )}
                            {Number(coupon.min_item_quantity) > 0 && (
                                <div>
                                    <p className="text-muted-foreground">Min Items</p>
                                    <p className="font-medium">{coupon.min_item_quantity}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-muted-foreground">Valid From</p>
                                <p className="font-medium">{formatDate(coupon.valid_from)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Valid Until</p>
                                <p className="font-medium">{formatDate(coupon.valid_until)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
