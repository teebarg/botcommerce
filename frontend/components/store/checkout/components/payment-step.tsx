import React from "react";
import { CreditCard } from "lucide-react";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { paymentInfoMap } from "@lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroupItem, RadioGroupWithLabel } from "@/components/ui/radio-group";
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
}

const PaymentStep: React.FC<PaymentStepProps> = ({ cart }) => {
    const { shopSettings } = useStore();
    const updateCartDetails = useUpdateCartDetails();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams);

            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );

    const handleChange = (providerId: PaymentMethod) => {
        updateCartDetails.mutate({ payment_method: providerId });
    };

    const handleEdit = () => {
        router.push(pathname + "?" + createQueryString("step", "payment"), {
            scroll: false,
        });
    };

    // const handleSubmit = () => {
    //     router.push(pathname + "?" + createQueryString("step", "review"), {
    //         scroll: false,
    //     });
    // };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-elegant animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                        <CreditCard className="h-6 w-6 text-accent" />
                        <span>Payment Details</span>
                    </CardTitle>
                    <CardDescription>Choose your payment method and complete your order</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroupWithLabel
                        className="grid grid-cols-1 md:grid-cols-3 gap-2"
                        label="Payment Method"
                        value={cart?.payment_method || ""}
                        onValueChange={(value: string) => handleChange(value as PaymentMethod)}
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
                                <RadioGroupItem key={idx} value={item.provider_id} variant="card">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 mt-0.5">{paymentInfoMap[item.provider_id]?.icon}</div>
                                        <div className="text-left">
                                            <div className="font-medium text-default-900">{paymentInfoMap[item.provider_id]?.title}</div>
                                            <div className="text-sm text-default-500">{paymentInfoMap[item.provider_id]?.description}</div>
                                        </div>
                                    </div>
                                </RadioGroupItem>
                            );
                        })}
                    </RadioGroupWithLabel>

                    {cart?.payment_method === "PAYSTACK" && <PaystackPayment cartNumber={cart.cart_number} amount={cart.total} />}

                    {cart?.payment_method === "BANK_TRANSFER" && <BankTransfer amount={cart.total} />}

                    {cart?.payment_method === "CASH_ON_DELIVERY" && <Pickup amount={cart.total} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentStep;
