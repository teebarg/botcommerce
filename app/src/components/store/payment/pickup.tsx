import { ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/providers/store-provider";
import { useCompleteCart } from "@/hooks/useCart";
import { currency } from "@/utils";

interface PickupProps {
    amount: number;
    canContinue: boolean;
    onSuccess?: () => void;
}

const Pickup: React.FC<PickupProps> = ({ amount, canContinue }) => {
    const { address } = useConfig();
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <>
            <div className="px-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium">Collection point</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{address}</p>
                            <p className="text-sm text-muted-foreground">Open Mon–Sat: 9am–6pm</p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Important information</p>
                        <ul className="space-y-1.5">
                            {[
                                "Bring your order confirmation email",
                                "Pay with cash or card at collection",
                                "Orders are held for 3 days before being returned to stock",
                            ].map((item) => (
                                <li key={item} className="text-xs text-muted-foreground pl-3 relative before:content-['·'] before:absolute before:left-0">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
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
        </>
    );
};

export default Pickup;
