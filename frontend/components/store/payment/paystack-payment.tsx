"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/client";
import { PaymentInitialize } from "@/types/payment";
import { currency } from "@/lib/utils";
import { tryCatch } from "@/lib/try-catch";

interface PaystackPaymentProps {
    cartNumber: string;
    amount: number;
    onSuccess?: () => void;
}

export function PaystackPayment({ cartNumber, amount }: PaystackPaymentProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handlePayment = async () => {
        setLoading(true);
        const { data, error } = await tryCatch<PaymentInitialize>(api.post(`/payment/initialize/${cartNumber}`));
        setLoading(false);

        if (error) {
            toast.error(error);

            return;
        }
        if (!data?.authorization_url) {
            toast.error("Authorization URL not found");

            return;
        }
        window.location.href = data?.authorization_url ?? "/";
    };

    return (
        <div className="space-y-4 border-t pt-6">
            <div className="p-4 bg-accent/10 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Paystack Payment</span>
                </h4>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {`You will be redirected to Paystack's secure payment gateway to complete your transaction.`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Secure SSL encryption</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Multiple payment options available</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Instant payment confirmation</span>
                    </div>
                </div>
            </div>
            <Button className="w-full" disabled={loading} isLoading={loading} size="lg" variant="luxury" onClick={handlePayment}>
                Pay {currency(amount)} Now
            </Button>
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
}
