"use client";

import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/providers/store-provider";
import { useCompleteCart } from "@/hooks/useCart";

interface PickupProps {
    amount: number;
    onSuccess?: () => void;
}

const Pickup: React.FC<PickupProps> = ({ amount }) => {
    const { settings } = useStoreSettings();
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3 p-4 bg-contrast/5 rounded-lg">
                <div className="flex items-start mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="ml-2">
                        <p className="text-sm font-semibold">Collection Point</p>
                        <p className="text-sm text-muted-foreground">{settings?.address}</p>
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

            <Button className="w-full" disabled={completeCart.isPending} isLoading={completeCart.isPending} size="lg" onClick={onPaymentCompleted}>
                Confirm Order for Pickup
            </Button>
        </div>
    );
};

export default Pickup;
