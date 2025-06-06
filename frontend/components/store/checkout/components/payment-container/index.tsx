import React from "react";

import { RadioGroup } from "@/components/ui/radio-group";
import { PaymentMethod } from "@/types/models";

type PaymentContainerProps = {
    paymentSession: { id: string; provider_id: PaymentMethod };
    selectedPaymentOptionId: string | null;
    disabled?: boolean;
    paymentInfoMap: Record<string, { title: string; description: string; icon: React.JSX.Element | any }>;
};

const PaymentContainer: React.FC<PaymentContainerProps> = ({ paymentSession, selectedPaymentOptionId, paymentInfoMap, disabled = false }) => {
    const isSelected = selectedPaymentOptionId === paymentSession.provider_id;
    const provider = paymentInfoMap[paymentSession.provider_id];

    return (
        <RadioGroup.Option
            key={paymentSession.id}
            className={`relative p-4 border rounded-lg cursor-pointer transition-all max-w-md ${
                isSelected ? "border-indigo-600" : "border-default-200 hover:border-default-300"
            }`}
            value={paymentSession.provider_id}
        >
            <div className="flex items-start">
                <div className="shrink-0 mt-0.5">{provider?.icon}</div>

                <div className="ml-3">
                    <h3 className="font-medium text-default-900">{provider?.title || paymentSession.provider_id}</h3>
                    <p className="text-sm text-default-500">{provider?.description}</p>
                </div>

                <div className="absolute right-4 top-4">
                    <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-indigo-600 bg-indigo-600" : "border-default-300"
                        }`}
                    >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                </div>
            </div>
        </RadioGroup.Option>
    );
};

export default PaymentContainer;
