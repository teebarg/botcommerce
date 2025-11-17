"use client";

import React, { useMemo, useState } from "react";
import { currency } from "@lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { Check, Info, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import ComponentLoader from "@/components/component-loader";
import { Card, CardContent } from "@/components/ui/card";
import { useApplyCoupon, useRemoveCoupon } from "@/lib/hooks/useCoupon";
import { toast } from "sonner";

const DiscountCode: React.FC = () => {
    const { cart, isLoading } = useCart();
    const [code, setCode] = useState("");
    const applyMutation = useApplyCoupon();
    const removeMutation = useRemoveCoupon();

    const appliedCoupon = useMemo(() => {
        if (!cart?.coupon_id) return null;
        return {
            code: "APPLIED", // You might want to include coupon code in cart response
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
        } catch (error: any) {}
    };

    if (isLoading) return <ComponentLoader className="h-[100px]" />;

    return (
        <div className="w-full flex flex-col">
            {appliedDiscount ? (
                <Card className="border-emerald-500 bg-emerald-500/5 w-fit">
                    <CardContent className="flex items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                                <Check className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Coupon Applied</p>
                                <p className="text-xs text-muted-foreground">-{appliedDiscount} discount applied</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeDiscountCode} disabled={removeMutation.isPending} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full">
                    <span className="flex gap-x-1 my-2 items-center">
                        Add coupon code
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="size-4 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>You can add multiple gift cards, but only one discount code.</p>
                            </TooltipContent>
                        </Tooltip>
                    </span>
                    <div className="flex w-full gap-x-2 items-center">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    applyDiscountCode();
                                }
                            }}
                            className="flex-1 bg-card"
                            data-testid="discount-input"
                            name="code"
                            placeholder="Enter coupon code"
                            type="text"
                            disabled={applyMutation.isPending}
                        />
                        <Button
                            aria-label="apply"
                            className="px-4 min-w-20 text-sm"
                            onClick={applyDiscountCode}
                            disabled={applyMutation.isPending || !code.trim()}
                        >
                            {applyMutation.isPending ? "Applying..." : "Apply"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountCode;
