import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentInitialize } from "@/types/payment";
import { currency } from "@/utils";
import { tryCatch } from "@/utils/try-catch";
import { api } from "@/utils/api";

interface PaystackPaymentProps {
    cartNumber: string;
    amount: number;
    canContinue: boolean;
}

export function PaystackPayment({ cartNumber, amount, canContinue }: PaystackPaymentProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handlePayment = async () => {
        setLoading(true);
        const { data, error } = await tryCatch<PaymentInitialize>(
            api.post<PaymentInitialize>(`/payment/initialize/${encodeURIComponent(cartNumber)}`)
        );

        setLoading(false);

        if (error) {
            toast.error(error ?? "Something went wrong");
            return;
        }
        if (!data?.authorization_url) {
            toast.error("Authorization URL not found");
            return;
        }
        window.location.href = data.authorization_url;
    };

    return (
        <>
            <div className="px-4 mt-4">
                <div className="rounded-xl bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-medium">Pay with Paystack</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {`You'll be redirected to Paystack to complete payment, then brought right back here.`}
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Card, bank transfer, or USSD",
                            "Instant confirmation, no delays",
                            "Your card details never touch our servers",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-3.5 w-3.5 text-success shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="checkout-footer">
                <Button
                    disabled={loading || !canContinue}
                    isLoading={loading}
                    size="lg"
                    onClick={handlePayment}
                    className="rounded-full text-md font-semibold w-full md:w-auto md:px-10"
                >
                    Pay {currency(amount)} Now
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
}