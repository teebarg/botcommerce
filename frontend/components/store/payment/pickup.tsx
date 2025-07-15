"use client";

import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/app/store/use-store";
import { useCompleteCart } from "@/lib/hooks/useCart";

interface PickupProps {
    amount: number;
    onSuccess?: () => void;
}

const Pickup: React.FC<PickupProps> = ({ amount }) => {
    const { shopSettings } = useStore();
    const completeCart = useCompleteCart();

    const onPaymentCompleted = async () => {
        completeCart.mutate({
            payment_status: "PENDING",
            status: "PENDING",
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-content1 p-4 rounded-lg space-y-3">
                <div className="flex items-start mb-3">
                    <MapPin className="text-indigo-600 w-5 h-5 mt-0.5 shrink-0" />
                    <div className="ml-2">
                        <p className="text-sm font-medium text-default-900">Collection Point</p>
                        <p className="text-sm text-default-500">{shopSettings?.address}</p>
                        <p className="text-sm text-default-500">Open Mon-Sat: 9am - 6pm</p>
                    </div>
                </div>

                <div className="border-t border-default-300 pt-3">
                    <p className="text-sm font-medium text-default-900 mb-1">Important Information:</p>
                    <ul className="text-xs text-default-500 space-y-1">
                        <li>• Please bring your order confirmation email</li>
                        <li>• You can pay with cash or card at collection</li>
                        <li>• Orders are held for 7 days before being returned to stock</li>
                    </ul>
                </div>
            </div>

            <Button
                className="w-full"
                disabled={completeCart.isPending}
                isLoading={completeCart.isPending}
                variant="primary"
                onClick={onPaymentCompleted}
            >
                Confirm Order for Pickup
            </Button>
        </div>
    );
};

export default Pickup;
