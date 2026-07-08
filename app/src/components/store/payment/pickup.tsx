import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompleteCart } from "@/hooks/useCart";
import { currency } from "@/utils";

interface PickupProps {
    amount: number;
    canContinue: boolean;
    onSuccess?: () => void;
}

const Pickup: React.FC<PickupProps> = ({ amount, canContinue }) => {
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <div className="checkout-footer">
            <Button
                disabled={completeCart.isPending || !canContinue}
                isLoading={completeCart.isPending}
                size="lg"
                onClick={onPaymentCompleted}
                className="rounded-full text-sm font-semibold w-full md:w-auto md:px-10"
            >
                Confirm Order {currency(amount)} for Pickup
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default Pickup;
