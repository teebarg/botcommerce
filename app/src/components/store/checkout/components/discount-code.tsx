import type React from "react";
import { useMemo, useState } from "react";
import { cn, currency } from "@/utils";
import { Check, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/useCoupon";
import { toast } from "sonner";
import { fireConfetti } from "@/utils/confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";

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
        } catch (error: any) {}
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
        } catch (error: any) {}
    };

    if (isLoading) return <ComponentLoader className="h-[100px]" />;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-card border border-border"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                </div>
                <Label className="font-semibold">Coupon Code</Label>
            </div>
            <AnimatePresence>
                {appliedDiscount ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-4 gap-4 text-sm mt-2 w-fit border-emerald-800 border rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Coupon Applied</p>
                                <p className="text-xs text-muted-foreground">-{appliedDiscount} discount applied</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeDiscountCode} disabled={removeMutation.isPending} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    applyDiscountCode();
                                }
                            }}
                            className="flex-1 bg-secondary border-0 uppercase"
                            data-testid="discount-input"
                            name="code"
                            placeholder="Enter coupon code"
                            type="text"
                            disabled={applyMutation.isPending || removeMutation.isPending}
                        />
                        <Button
                            onClick={applyDiscountCode}
                            variant={appliedDiscount ? "default" : "outline"}
                            className={cn(appliedDiscount && "gradient-primary")}
                            isLoading={applyMutation.isPending}
                        >
                            {appliedDiscount ? <Check className="w-4 h-4" /> : "Apply"}
                        </Button>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DiscountCode;
