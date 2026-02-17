import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/providers/store-provider";
import { useCompleteCart } from "@/hooks/useCart";

interface PickupProps {
    amount: number;
    canContinue: boolean;
    onSuccess?: () => void;
}

const Pickup: React.FC<PickupProps> = ({ amount, canContinue }) => {
    const { config } = useConfig();
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <>
            <div className="space-y-4 px-4">
                <div className="space-y-3 p-4 bg-contrast/5 rounded-lg">
                    <div className="flex items-start mb-3">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="ml-2">
                            <p className="text-sm font-semibold">Collection Point</p>
                            <p className="text-sm text-muted-foreground">{config?.address}</p>
                            <p className="text-sm text-muted-foreground">Open Mon-Sat: 9am - 6pm</p>
                        </div>
                    </div>

                    <div className="border-t border-border pt-3">
                        <p className="text-sm font-semibold mb-1">Important Information:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Please bring your order confirmation email</li>
                            <li>• You can pay with cash or card at collection</li>
                            <li>• Orders are held for 3 days before being returned to stock</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex justify-end py-2 sticky px-4 bottom-0 border-t md:border-t-0 bg-background mt-4">
                <Button
                    disabled={completeCart.isPending || !canContinue}
                    isLoading={completeCart.isPending}
                    size="lg"
                    onClick={onPaymentCompleted}
                    className="bg-gradient-action shadow-glow hover:opacity-90 transition-opacity h-14 rounded-2xl text-base font-semibold w-full md:w-sm"
                >
                    Confirm Order for Pickup
                </Button>
            </div>
        </>
    );
};

export default Pickup;
