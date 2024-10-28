import { RadioGroup } from "@headlessui/react";
import { InformationCircleSolid } from "nui-react-icons";
import React from "react";
import clsx from "clsx";
import Radio from "@modules/common/components/radio";
import PaymentTest from "../payment-test";
import { Tooltip } from "@components/ui/tooltip";

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
                className={clsx("flex flex-col gap-y-2 text-sm cursor-pointer py-4 border rounded-lg px-8 mb-2", {
                    "border-blue-400": selectedPaymentOptionId === paymentSession.provider_id,
                })}
                disabled={disabled}
                value={paymentSession.provider_id}
            >
                <div className="flex items-center justify-between ">
                    <div className="flex items-center gap-x-4 relative">
                        <Radio checked={selectedPaymentOptionId === paymentSession.provider_id} />
                        <p className="text-base">{paymentInfoMap[paymentSession.provider_id]?.title || paymentSession.provider_id}</p>
                        {process.env.NODE_ENV === "development" && !Object.hasOwn(paymentInfoMap, paymentSession.provider_id) && (
                            <Tooltip content="You can add a user-friendly name and icon for this payment provider in 'src/modules/checkout/components/payment/index.tsx'">
                                <span>
                                    <InformationCircleSolid />
                                </span>
                            </Tooltip>
                        )}

                        {paymentSession.provider_id === "manual" && isDevelopment && <PaymentTest className="hidden sm:block" />}
                    </div>
                    <span className="justify-self-end text-default-800">{paymentInfoMap[paymentSession.provider_id]?.icon}</span>
                </div>
                {paymentSession.provider_id === "manual" && isDevelopment && <PaymentTest className="sm:hidden text-[10px]" />}
            </RadioGroup.Option>
        </>
    );
};

export default PaymentContainer;
