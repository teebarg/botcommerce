import React from "react";
import { CreditCard } from "lucide-react";
import { paymentInfoMap } from "@lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroupItem, RadioGroupWithLabel } from "@/components/ui/radio-group";
import { Cart, PaymentMethod } from "@/schemas";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";
import { PaystackPayment } from "@/components/store/payment/paystack-payment";
import BankTransfer from "@/components/store/payment/bank-transfer";
import Pickup from "@/components/store/payment/pickup";
import { useStoreSettings } from "@/providers/store-provider";
import DiscountCode from "./discount-code";
import { Separator } from "@/components/ui/separator";
import { ZeroPayment } from "../../payment/zero-payment";

const payMethods: { id: string; provider_id: PaymentMethod }[] = [
    { id: "pickup", provider_id: "CASH_ON_DELIVERY" },
    { id: "manual", provider_id: "BANK_TRANSFER" },
    { id: "paystack", provider_id: "PAYSTACK" },
];

interface PaymentStepProps {
    cart: Cart | null;
    onBack?: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ cart }) => {
    const { settings } = useStoreSettings();
    const updateCartDetails = useUpdateCartDetails();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<PaymentMethod | null>(null);

    const handleChange = (providerId: PaymentMethod) => {
        setSelectedPaymentMethod(providerId);
        updateCartDetails.mutate({ payment_method: providerId });
    };

    return (
        <Card className="animate-fade-in w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span>Payment Details</span>
                </CardTitle>
                <CardDescription>Choose your payment method and complete your order</CardDescription>
            </CardHeader>
            <CardContent>
                <DiscountCode />
                <Separator className="my-6" />
                {cart?.total! < 1 ? (
                    <ZeroPayment />
                ) : (
                    <>
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
                                    (item.provider_id === "CASH_ON_DELIVERY" && settings?.payment_cash != "true") ||
                                    (item.provider_id === "BANK_TRANSFER" && settings?.payment_bank != "true") ||
                                    (item.provider_id === "PAYSTACK" && settings?.payment_paystack != "true") ||
                                    (cart?.shipping_method !== "PICKUP" && item.provider_id === "CASH_ON_DELIVERY")
                                ) {
                                    return null;
                                }

                                return (
                                    <RadioGroupItem
                                        key={idx}
                                        loading={updateCartDetails.isPending && selectedPaymentMethod === item.provider_id}
                                        value={item.provider_id}
                                        variant="card"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="shrink-0 mt-0.5 text-primary">{paymentInfoMap[item.provider_id]?.icon}</div>
                                            <div className="text-left">
                                                <div className="font-medium">{paymentInfoMap[item.provider_id]?.title}</div>
                                                <div className="text-sm text-muted-foreground">{paymentInfoMap[item.provider_id]?.description}</div>
                                            </div>
                                        </div>
                                    </RadioGroupItem>
                                );
                            })}
                        </RadioGroupWithLabel>
                        <Separator className="my-6" />

                        {cart?.payment_method === "PAYSTACK" && <PaystackPayment amount={cart.total} cartNumber={cart.cart_number} />}

                        {cart?.payment_method === "BANK_TRANSFER" && <BankTransfer amount={cart.total} />}

                        {cart?.payment_method === "CASH_ON_DELIVERY" && <Pickup amount={cart.total} />}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PaymentStep;
