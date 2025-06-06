"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/base";
import { PaymentInitialize } from "@/types/payment";
import { currency } from "@/lib/utils";

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
                <p className="text-sm text-default-500 mb-2">{`You'll be redirected to Paystack to complete your payment securely.`}</p>
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-content2 rounded-full flex items-center justify-center mr-2">
                        <svg
                            id="Layer_1"
                            version="1.1"
                            viewBox="0 0 44.6 44.3"
                            x="0px"
                            xmlSpace="preserve"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            y="0px"
                        >
                            <g>
                                <g>
                                    <path
                                        d="M39.9,0H2.3C1.1,0,0,1.1,0,2.4v4.2C0,7.9,1.1,9,2.3,9h37.6c1.3,0,2.3-1.1,2.4-2.4V2.4C42.3,1.1,41.2,0,39.9,0
			L39.9,0z M39.9,23.6H2.3c-0.6,0-1.2,0.3-1.7,0.7C0.2,24.7,0,25.3,0,26v4.2c0,1.3,1.1,2.4,2.3,2.4h37.6c1.3,0,2.3-1,2.4-2.4V26
			C42.3,24.6,41.2,23.6,39.9,23.6L39.9,23.6z M23.5,35.4H2.3c-0.6,0-1.2,0.2-1.6,0.7c-0.4,0.4-0.7,1-0.7,1.7V42
			c0,1.3,1.1,2.4,2.3,2.4h21.1c1.3,0,2.3-1.1,2.3-2.4v-4.3C25.8,36.4,24.8,35.4,23.5,35.4L23.5,35.4z M42.3,11.8h-40
			c-0.6,0-1.2,0.2-1.6,0.7c-0.4,0.4-0.7,1-0.7,1.7v4.2c0,1.3,1.1,2.4,2.3,2.4h39.9c1.3,0,2.3-1.1,2.3-2.4v-4.2
			C44.6,12.9,43.6,11.8,42.3,11.8L42.3,11.8z M42.3,11.8"
                                        fill="#00C3F7"
                                    />
                                </g>
                            </g>
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-default-500">Secured by Paystack</span>
                </div>
            </div>
            <Button variant="primary" className="w-full" disabled={loading} isLoading={loading} onClick={handlePayment}>
                Pay {currency(amount)} Now
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
