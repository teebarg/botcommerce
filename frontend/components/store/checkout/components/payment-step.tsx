import React from "react";
import { CreditCard, ArrowLeft } from "lucide-react";
import { paymentInfoMap } from "@lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroupItem, RadioGroupWithLabel } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Cart, PaymentMethod } from "@/schemas";
import { useStore } from "@/app/store/use-store";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";
import { PaystackPayment } from "@/components/store/payment/paystack-payment";
import BankTransfer from "@/components/store/payment/bank-transfer";
import Pickup from "@/components/store/payment/pickup";

const payMethods: { id: string; provider_id: PaymentMethod }[] = [
    { id: "pickup", provider_id: "CASH_ON_DELIVERY" },
    { id: "manual", provider_id: "BANK_TRANSFER" },
    { id: "paystack", provider_id: "PAYSTACK" },
];

interface PaymentStepProps {
    cart: Cart | null;
    onBack?: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ cart, onBack }) => {
    const { shopSettings } = useStore();
    const updateCartDetails = useUpdateCartDetails();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<PaymentMethod | null>(null);

    const handleChange = (providerId: PaymentMethod) => {
        setSelectedPaymentMethod(providerId);
        updateCartDetails.mutate({ payment_method: providerId });
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    return (
        <Card className="shadow-elegant animate-fade-in w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                    <CreditCard className="h-6 w-6 text-accent" />
                    <span>Payment Details</span>
                </CardTitle>
                <CardDescription>Choose your payment method and complete your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroupWithLabel
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                    label="Payment Method"
                    value={cart?.payment_method || ""}
                    onValueChange={(value: string) => {
                        handleChange(value as PaymentMethod);
                    }}
                >
                    {payMethods.map((item: { id: string; provider_id: PaymentMethod }, idx: number) => {
                        if (
                            (item.provider_id === "CASH_ON_DELIVERY" && shopSettings?.payment_cash != "true") ||
                            (item.provider_id === "BANK_TRANSFER" && shopSettings?.payment_bank != "true") ||
                            (item.provider_id === "PAYSTACK" && shopSettings?.payment_paystack != "true") ||
                            (cart?.shipping_method !== "PICKUP" && item.provider_id === "CASH_ON_DELIVERY")
                        ) {
                            return null;
                        }

                        return (
                            <RadioGroupItem
                                key={idx}
                                value={item.provider_id}
                                variant="card"
                                loading={updateCartDetails.isPending && selectedPaymentMethod === item.provider_id}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0 mt-0.5 text-accent">{paymentInfoMap[item.provider_id]?.icon}</div>
                                    <div className="text-left">
                                        <div className="font-medium text-default-900">{paymentInfoMap[item.provider_id]?.title}</div>
                                        <div className="text-sm text-default-500">{paymentInfoMap[item.provider_id]?.description}</div>
                                    </div>
                                </div>
                            </RadioGroupItem>
                        );
                    })}
                </RadioGroupWithLabel>

                {cart?.payment_method === "PAYSTACK" && <PaystackPayment amount={cart.total} cartNumber={cart.cart_number} />}

                {cart?.payment_method === "BANK_TRANSFER" && <BankTransfer amount={cart.total} />}

                {cart?.payment_method === "CASH_ON_DELIVERY" && <Pickup amount={cart.total} />}
                <div className="pt-4">
                    <Button className="flex items-center gap-2" variant="outline" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                        {cart?.shipping_method === "PICKUP" ? "Back to Delivery" : "Back to Address"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentStep;
