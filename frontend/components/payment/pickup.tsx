"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/apis";

interface PickupProps {
    amount: number;
    onSuccess?: () => void;
}

const Pickup: React.FC<PickupProps> = ({ amount }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const onPaymentCompleted = async () => {
        setLoading(true);
        const { data, error } = await api.cart.complete({
            payment_status: "PENDING",
            status: "PENDING",
        });

        if (error) {
            toast.error(error);
            setLoading(false);

            return;
        }

        router.push(`/order/confirmed/${data?.order_number}`);
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-start mb-3">
                    <MapPin className="text-indigo-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="ml-2">
                        <p className="text-sm font-medium text-gray-700">Collection Point</p>
                        <p className="text-sm text-gray-600">123 Shopping Street, Main City</p>
                        <p className="text-sm text-gray-600">Open Mon-Sat: 9am - 6pm</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Important Information:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Please bring your order confirmation email</li>
                        <li>• You can pay with cash or card at collection</li>
                        <li>• Orders are held for 7 days before being returned to stock</li>
                        <li>• Photo ID may be required for verification</li>
                    </ul>
                </div>
            </div>

            <Button className="w-full" disabled={loading} onClick={onPaymentCompleted}>
                {loading ? "Processing..." : "Confirm Order for Pickup"}
            </Button>
            {/* Security message */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
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
