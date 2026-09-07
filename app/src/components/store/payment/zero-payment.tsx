import { Button } from "@/components/ui/button";
import { usePlaceOrder } from "@/hooks/useCart";

export function ZeroPayment() {
    const completeCart = usePlaceOrder();

    const onPaymentCompleted = async () => {
        completeCart.mutate();
    };

    return (
        <div className="space-y-4">
            <Button className="w-full" disabled={completeCart.isPending} isLoading={completeCart.isPending} size="lg" onClick={onPaymentCompleted}>
                Complete Order Now
            </Button>
        </div>
    );
}
