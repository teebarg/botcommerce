"use client";

import { Button } from "@/components/ui/button";
import { useCompleteCart } from "@/lib/hooks/useCart";

export function ZeroPayment() {
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "SUCCESS",
            status: "PENDING",
        });
    };

    return (
        <div className="space-y-4">
            <Button className="w-full" disabled={completeCart.isPending} isLoading={completeCart.isPending} size="lg" onClick={onPaymentCompleted}>
                Complete Order Now
            </Button>
        </div>
    );
}
