import type React from "react";
import { useMemo, useState } from "react";
import { currency } from "@/utils";
import { Check, ChevronDown, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/useCoupon";
import { toast } from "sonner";
import { fireConfetti } from "@/utils/confetti";
import { PageLoader } from "@/components/generic/page-loader";
import { cn } from "@/utils/cn";

const DiscountCode: React.FC = () => {
    const { cart, isLoading } = useCart();
    const [code, setCode] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
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
        <div>
            <button className="flex items-center justify-between mb-2 w-full" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-accent" />
                    <p className="text-sm">Have a coupon code?</p>
                </div>
                <ChevronDown className="h-5 w-5" />
            </button>
            <div className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}>
                {(isOpen || appliedDiscount) && (
                    <div className="overflow-hidden min-h-0">
                        {appliedDiscount ? (
                            <div className="flex bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 p-2 rounded-xl">
                                <div className="flex items-center gap-1.5 flex-1">
                                    <Check className="h-4 w-4" />
                                    <p className="text-sm">Code applied - You saved {appliedDiscount} </p>
                                </div>
                                <Button variant="ghost" onClick={removeDiscountCode} disabled={removeMutation.isPending} className="text-sm bg-transparent">
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 py-1 rounded-lg border border-dashed border-accent animate-in fade-in duration-300">
                                <div className="flex-1">
                                    <Input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                applyDiscountCode();
                                            }
                                        }}
                                        className="border-0 uppercase focus-visible:ring-0 rounded-none shadow-none"
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscountCode;
