import React from "react";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/util/cn";
import { PaymentMethod } from "@/types/models";

type PaymentContainerProps = {
    paymentSession: { id: string; provider_id: PaymentMethod };
    selectedPaymentOptionId: string | null;
    disabled?: boolean;
    paymentInfoMap: Record<string, { title: string; description: string; icon: React.JSX.Element | any }>;
};

const PaymentContainer: React.FC<PaymentContainerProps> = ({ paymentSession, selectedPaymentOptionId, paymentInfoMap, disabled = false }) => {
    return (
        <>
            <RadioGroup.Option
                key={paymentSession.id}
                className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all max-w-md",
                    selectedPaymentOptionId === paymentSession.provider_id
                        ? "border-green-400 bg-transparent"
                        : "border-default-300 hover:border-default-400"
                )}
                value={paymentSession.provider_id}
            >
                {/* Icon */}
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-lg",
                        selectedPaymentOptionId === paymentSession.provider_id ? "bg-green-400 text-white" : "bg-default-200 text-default-600"
                    )}
                >
                    {paymentInfoMap[paymentSession.provider_id]?.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                    <h3
                        className={cn(
                            "text-sm font-medium",
                            selectedPaymentOptionId === paymentSession.provider_id ? "text-green-500" : "text-default-800"
                        )}
                    >
                        {paymentInfoMap[paymentSession.provider_id]?.title || paymentSession.provider_id}
                    </h3>
                    <p className="text-sm text-default-600">{paymentInfoMap[paymentSession.provider_id]?.description}</p>
                </div>

                {/* Radio Indicator */}
                <div
                    className={cn(
                        "h-5 w-5 rounded-full border-2",
                        selectedPaymentOptionId === paymentSession.provider_id ? "border-green-500 bg-green-500" : "border-default-300"
                    )}
                />
            </RadioGroup.Option>
        </>
    );
};

export default PaymentContainer;
