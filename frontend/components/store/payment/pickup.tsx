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
            payment_status: "SUCCESS",
            status: "PAID",
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
            {/* Security message */}
            <div className="mt-4 flex items-center justify-center text-xs text-default-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    />
                </svg>
                Secure 256-bit SSL encrypted payment
            </div>
        </div>
    );
};

export default Pickup;
