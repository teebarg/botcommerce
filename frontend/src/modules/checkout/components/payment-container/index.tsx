import { InformationCircleSolid } from "nui-react-icons";
import React from "react";
import { Tooltip } from "@components/ui/tooltip";

import PaymentTest from "../payment-test";

import { RadioGroup } from "@/components/ui/radio-group";

type PaymentContainerProps = {
    paymentSession: any;
    selectedPaymentOptionId: string | null;
    disabled?: boolean;
    paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>;
};

const PaymentContainer: React.FC<PaymentContainerProps> = ({ paymentSession, selectedPaymentOptionId, paymentInfoMap, disabled = false }) => {
    const isDevelopment = process.env.NODE_ENV === "development";

    return (
        <>
            <RadioGroup.Option
                key={paymentSession.id}
                className={selectedPaymentOptionId === paymentSession.provider_id ? "border-primary" : ""}
                value={paymentSession.provider_id}
            >
                <div className="flex items-center gap-x-4">
                    <RadioGroup.Radio checked={selectedPaymentOptionId === paymentSession.provider_id} />
                    <span className="text-base">{paymentInfoMap[paymentSession.provider_id]?.title || paymentSession.provider_id}</span>
                    {process.env.NODE_ENV === "development" && !Object.hasOwn(paymentInfoMap, paymentSession.provider_id) && (
                        <Tooltip content="You can add a user-friendly name and icon for this payment provider in 'src/modules/checkout/components/payment/index.tsx'">
                            <span>
                                <InformationCircleSolid />
                            </span>
                        </Tooltip>
                    )}
                    {paymentSession.provider_id === "manual" && isDevelopment && <PaymentTest className="hidden sm:block" />}
                </div>
                <span className="justify-self-end text-default-900">{paymentInfoMap[paymentSession.provider_id]?.icon}</span>
                {paymentSession.provider_id === "manual" && isDevelopment && <PaymentTest className="sm:hidden text-[10px]" />}
            </RadioGroup.Option>
        </>
    );
};

export default PaymentContainer;
