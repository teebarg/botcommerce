import { useState } from "react";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentInitialize } from "@/types/payment";
import { currency } from "@/utils";
import { tryCatch } from "@/utils/try-catch";
import { clientApi } from "@/utils/api.client";

interface PaystackPaymentProps {
    cartNumber: string;
    amount: number;
    canContinue: boolean;
    onSuccess?: () => void;
}

export function PaystackPayment({ cartNumber, amount, canContinue }: PaystackPaymentProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handlePayment = async () => {
        setLoading(true);
        const { data, error } = await tryCatch<PaymentInitialize>(clientApi.post<PaymentInitialize>(`/payment/initialize/${cartNumber}`));

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
        <>
            <div className="px-4 mt-4">
                <div className="p-4 bg-contrast/10 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-contrast" />
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
            </div>
            <div className="flex justify-end py-2 sticky px-4 bottom-0 border-t md:border-t-0 bg-background mt-4">
                <Button
                    disabled={loading || !canContinue}
                    isLoading={loading}
                    size="lg"
                    onClick={handlePayment}
                    className="bg-gradient-action shadow-glow hover:opacity-90 transition-opacity h-14 rounded-2xl text-base font-semibold w-full md:w-sm"
                >
                    Pay {currency(amount)} Now
                </Button>
            </div>
        </>
    );
}
