import type React from "react";
import { useMemo, useState } from "react";
import { cn, currency } from "@/utils";
import { Check, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/useCoupon";
import { toast } from "sonner";
import { fireConfetti } from "@/utils/confetti";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/generic/page-loader";

const DiscountCode: React.FC = () => {
    const { cart, isLoading } = useCart();
    const [code, setCode] = useState<string>("");
    const applyMutation = useApplyCoupon();
    const removeMutation = useRemoveCoupon();

    const appliedCoupon = useMemo(() => {
        if (!cart?.coupon_id) return null;
        return {
            discount_amount: cart.discount_amount || 0,
        };
    }, [cart]);

    const appliedDiscount = useMemo(() => {
        if (!appliedCoupon) return null;
        if (appliedCoupon.discount_amount) {
            return currency(appliedCoupon.discount_amount);
        }
        return null;
    }, [appliedCoupon]);

    const removeDiscountCode = async () => {
        try {
            await removeMutation.mutateAsync();
        } catch (error: any) { }
    };

    const applyDiscountCode = async () => {
        if (!code.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        try {
            await applyMutation.mutateAsync(code);
            setCode("");
            fireConfetti();
        } catch (error: any) { }
    };

    if (isLoading) return <PageLoader variant="box" />;
    return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-accent animate-in fade-in duration-300">
            {appliedDiscount ? (
                <>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <Check className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Coupon Applied</p>
                            <p className="text-xs text-muted-foreground">-{appliedDiscount} discount applied</p>
                        </div>
                    </div>
                    <Button variant="accent" size="icon" onClick={removeDiscountCode} disabled={removeMutation.isPending} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <Tag className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 bg">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    applyDiscountCode();
                                }
                            }}
                            className="border-0 uppercase focus-visible:ring-0"
                            data-testid="discount-input"
                            name="code"
                            placeholder="Enter coupon code"
                            type="text"
                            disabled={applyMutation.isPending || removeMutation.isPending}
                        />
                    </div>
                    <Button
                        onClick={applyDiscountCode}
                        variant="ghost"
                        className="bg-transparent text-accent"
                        isLoading={applyMutation.isPending}
                        disabled={!code}
                    >
                        Apply
                    </Button>
                </>
            )}
        </div>
    );
};

export default DiscountCode;
