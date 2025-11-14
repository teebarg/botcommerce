import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Power, PowerOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { useCoupons, useDeleteCoupon, useToggleCouponStatus } from "@/lib/hooks/useCoupon";
import { Coupon } from "@/schemas";
import ComponentLoader from "@/components/component-loader";
import { currency, formatDate } from "@/lib/utils";
import { EditCouponDialog } from "./edit-coupon-dialog";

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
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleDelete = async (id: number, code: string) => {
        if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
        try {
            await deleteMutation.mutateAsync(id);
        } catch (error) {
            // Error handled in hook
        }
    };

    if (isLoading) return <ComponentLoader className="h-[200px]" />;

    return (
        <div className="space-y-4">
            {coupons.map((coupon: Coupon) => (
                <Card key={coupon.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-xl font-semibold">{coupon.code}</CardTitle>
                                <Badge variant={coupon.is_active ? "default" : "secondary"}>{coupon.is_active ? "active" : "inactive"}</Badge>
                                {coupon.scope === "SPECIFIC_USERS" && <Badge variant="outline">VIP Only</Badge>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(coupon.code)} className="h-8 w-8">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <EditCouponDialog coupon={coupon} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleStatus(coupon.id)}
                                    disabled={toggleMutation.isPending}
                                    className="h-8 w-8"
                                >
                                    {coupon.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(coupon.id, coupon.code)}
                                    disabled={deleteMutation.isPending}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Discount</p>
                                <p className="font-medium">
                                    {coupon.discount_type === "PERCENTAGE"
                                        ? `${coupon.discount_value}% off`
                                        : `${currency(coupon.discount_value)} off`}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Usage</p>
                                <p className="font-medium">
                                    {coupon.current_uses ?? 0} / {coupon.max_uses}
                                </p>
                            </div>
                            {coupon.min_cart_value && (
                                <div>
                                    <p className="text-muted-foreground">Min Cart Value</p>
                                    <p className="font-medium">{currency(coupon.min_cart_value)}</p>
                                </div>
                            )}
                            {coupon.min_item_quantity && (
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
