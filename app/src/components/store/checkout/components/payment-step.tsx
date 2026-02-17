import React from "react";
import { paymentInfoMap } from "@/utils/constants";
import { RadioGroupItem, RadioGroupWithLabel } from "@/components/ui/radio-group";
import type { Cart, PaymentMethod } from "@/schemas";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { PaystackPayment } from "@/components/store/payment/paystack-payment";
import BankTransfer from "@/components/store/payment/bank-transfer";
import Pickup from "@/components/store/payment/pickup";
import { useConfig } from "@/providers/store-provider";
import DiscountCode from "./discount-code";
import CartContactForm from "../contact";
import { ZeroPayment } from "../../payment/zero-payment";
import { motion } from "framer-motion";

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
    const { config } = useConfig();
    const updateCartDetails = useUpdateCartDetails();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<PaymentMethod | null>(null);
    const canContinue = Boolean(cart?.phone) && Boolean(cart?.payment_method);

    const handleChange = (providerId: PaymentMethod) => {
        setSelectedPaymentMethod(providerId);
        updateCartDetails.mutate({ payment_method: providerId });
    };

    return (
        <div className="flex-1 overflow-y-auto pb-4">
            <div className="space-y-6 px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
                    <p className="text-muted-foreground">Complete your order</p>
                </motion.div>

                <DiscountCode />

                <CartContactForm />

                {cart?.phone && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {cart?.total! < 1 ? (
                            <ZeroPayment />
                        ) : (
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
                                        (item.provider_id === "CASH_ON_DELIVERY" && config?.payment_cash != "true") ||
                                        (item.provider_id === "BANK_TRANSFER" && config?.payment_bank != "true") ||
                                        (item.provider_id === "PAYSTACK" && config?.payment_paystack != "true") ||
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
                                                    <div className="text-sm text-muted-foreground">
                                                        {paymentInfoMap[item.provider_id]?.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </RadioGroupItem>
                                    );
                                })}
                            </RadioGroupWithLabel>
                        )}
                    </motion.div>
                )}
            </div>
            {cart?.payment_method === "PAYSTACK" && <PaystackPayment amount={cart.total} cartNumber={cart.cart_number} canContinue={canContinue} />}
            {cart?.payment_method === "BANK_TRANSFER" && <BankTransfer amount={cart.total} canContinue={canContinue} />}
            {cart?.payment_method === "CASH_ON_DELIVERY" && <Pickup amount={cart.total} canContinue={canContinue} />}
        </div>
    );
};

export default PaymentStep;
