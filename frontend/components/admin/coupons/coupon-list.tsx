import { toast } from "sonner";

import { SwipeableCouponCard } from "./swipeable-coupon-card";

import { Card, CardContent } from "@/components/ui/card";
import { useCoupons, useDeleteCoupon, useToggleCouponStatus } from "@/lib/hooks/useCoupon";
import ComponentLoader from "@/components/component-loader";

export const CouponList = () => {
    const { data, isLoading } = useCoupons();
    const coupons = data?.coupons || [];
    const toggleMutation = useToggleCouponStatus();
    const deleteMutation = useDeleteCoupon();

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Copied!", {
            description: `Coupon code "${code}" copied to clipboard`,
        });
    };

    const toggleStatus = async (id: number) => {
        try {
            await toggleMutation.mutateAsync(id);
            toast.success("Coupon status updated successfully");
        } catch (error) {}
    };

    const handleDelete = async (id: number, code: string) => {
        const toastId = toast.loading("Deleting coupon...");
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Coupon deleted successfully", { id: toastId });
        } catch (error) {}
    };

    if (isLoading) return <ComponentLoader className="h-[200px]" />;

    return (
        <div className="space-y-4">
            {coupons.map((coupon) => (
                <SwipeableCouponCard key={coupon.id} coupon={coupon} onCopy={handleCopy} onDelete={handleDelete} onToggleStatus={toggleStatus} />
            ))}
            {coupons.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">No coupons created yet</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
