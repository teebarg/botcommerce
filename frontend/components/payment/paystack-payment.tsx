"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { paymentApi } from "@/apis/payment";

interface PaystackPaymentProps {
    orderId: number;
    amount: number;
    onSuccess?: () => void;
}

export function PaystackPayment({ orderId, amount, onSuccess }: PaystackPaymentProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        try {
            setLoading(true);
            const response = await paymentApi.initialize(orderId);

            // Redirect to Paystack payment page
            window.location.href = response.data?.authorization_url ?? "/";
        } catch (error) {
            toast.error("Failed to initialize payment");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Pay with Paystack</h3>
                        <p className="text-sm text-muted-foreground">You will be redirected to Paystack to complete your payment</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total amount</p>
                    </div>
                </div>
            </div>

            <Button className="w-full" disabled={loading} onClick={handlePayment}>
                {loading ? "Processing..." : "Pay Now"}
            </Button>
        </div>
    );
}
