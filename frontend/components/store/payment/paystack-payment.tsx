"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/base";
import { PaymentInitialize } from "@/types/payment";
import { currency } from "@/lib/util/util";

interface PaystackPaymentProps {
    cartNumber: string;
    amount: number;
    onSuccess?: () => void;
}

export function PaystackPayment({ cartNumber, amount }: PaystackPaymentProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handlePayment = async () => {
        try {
            setLoading(true);
            const { data, error } = await api.post<PaymentInitialize>(`/payment/initialize/${cartNumber}`);

            if (error || !data) {
                toast.error(error || "Failed to initialize payment");

                return;
            }
            // Redirect to Paystack payment page
            window.location.href = data?.authorization_url ?? "/";
        } catch (error) {
            toast.error(`${error} ?? "Failed to initialize payment"`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Details based on selected method */}
            <div className="bg-content1 p-4 rounded-lg">
                <p className="text-sm text-default-700 mb-2">{`You'll be redirected to Paystack to complete your payment securely.`}</p>
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-content2 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <path d="M19.8657 9.24313H18.0925V14.2204H19.8657V9.24313Z" fill="#00C3F7" />
                            <path d="M9.93359 9.24313V14.2204H11.8373V16.5547H13.7068V14.2204H15.5139V9.24313H9.93359Z" fill="#00C3F7" />
                            <path d="M6.08594 9.24313V14.2204H7.98969V16.5547H9.85914V14.2204H11.6663V9.24313H6.08594Z" fill="#00C3F7" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-default-500">Secured by Paystack</span>
                </div>
            </div>
            <Button className="w-full" disabled={loading} isLoading={loading} onClick={handlePayment}>
                Pay ${currency(amount)} Now
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
}
