"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RadioGroup } from "@headlessui/react";
import ErrorMessage from "@modules/checkout/components/error-message";
import { CheckCircleSolid, CreditCard } from "nui-react-icons";
import Spinner from "@modules/common/icons/spinner";
import PaymentContainer from "@modules/checkout/components/payment-container";
import { setPaymentMethod } from "@modules/checkout/actions";
import { paymentInfoMap } from "@lib/constants";
import clsx from "clsx";
import { Tooltip } from "@nextui-org/tooltip";
import Button from "@modules/common/components/button";
import { Cart, PaymentSession } from "types/global";

const payMethods = [
    { id: "stripe", provider_id: "Stripe" },
    { id: "manual", provider_id: "Bank Transfer" },
];

const Payment = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get("step") === "payment";

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const paymentReady = (cart?.payment_session && cart?.shipping_method?.name);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams);

            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );

    const set = async (providerId: string) => {
        setIsLoading(true);
        const method = payMethods.find((item) => item.provider_id == providerId)

        await setPaymentMethod(method as PaymentSession)
            .catch((err) => setError(err.toString()))
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleChange = (providerId: string) => {
        setError(null);
        set(providerId);
    };

    const handleEdit = () => {
        router.push(pathname + "?" + createQueryString("step", "payment"), {
            scroll: false,
        });
    };

    const handleSubmit = () => {
        setIsLoading(true);
        router.push(pathname + "?" + createQueryString("step", "review"), {
            scroll: false,
        });
    };

    useEffect(() => {
        setIsLoading(false);
        setError(null);
    }, [isOpen]);

    return (
        <div>
            <div className="flex flex-row items-center justify-between mb-6">
                <h2
                    className={clsx("flex flex-row text-3xl gap-x-2 items-baseline", {
                        "opacity-50 pointer-events-none select-none": !isOpen && !paymentReady,
                    })}
                >
                    Payment
                    {!isOpen && paymentReady && <CheckCircleSolid />}
                </h2>
                {!isOpen && paymentReady && (
                    <button className="hover:text-blue-400" data-testid="edit-payment-button" onClick={handleEdit}>
                        Edit
                    </button>
                )}
            </div>
            <div>
                <div className={isOpen ? "block" : "hidden"}>
                    {!paidByGiftcard ? (
                        <>
                            <RadioGroup value={cart?.payment_session?.provider_id || ""} onChange={(value: string) => handleChange(value)}>
                                {payMethods.map((item) => (
                                    <PaymentContainer
                                        key={item.id}
                                        paymentInfoMap={paymentInfoMap}
                                        paymentSession={item}
                                        selectedPaymentOptionId={cart?.payment_session?.provider_id || null}
                                    />
                                ))}
                            </RadioGroup>
                        </>
                    ) : paidByGiftcard ? (
                        <div className="flex flex-col w-1/3">
                            <p className="font-medium text-base mb-1">Payment method</p>
                            <p className="font-normal text-base text-default-600" data-testid="payment-method-summary">
                                Gift card
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-default-800">
                            <Spinner />
                        </div>
                    )}

                    <ErrorMessage data-testid="payment-method-error-message" error={error} />

                    <Button
                        className="mt-6"
                        data-testid="submit-payment-button"
                        disabled={!cart?.payment_session && !paidByGiftcard}
                        isLoading={isLoading}
                        size="lg"
                        onClick={handleSubmit}
                    >
                        Continue to review
                    </Button>
                </div>

                <div className={isOpen ? "hidden" : "block"}>
                    {cart && paymentReady && cart.payment_session.provider_id ? (
                        <div className="flex items-start gap-x-1 w-full">
                            <div className="flex flex-col w-1/3">
                                <p className="font-medium text-base mb-1">Payment method</p>
                                <p className="font-normal text-base text-default-600" data-testid="payment-method-summary">
                                    {paymentInfoMap[cart.payment_session.id]?.title || cart.payment_session.provider_id}
                                </p>
                                {process.env.NODE_ENV === "development" && !Object.hasOwn(paymentInfoMap, cart.payment_session.provider_id) && (
                                    <Tooltip content="You can add a user-friendly name and icon for this payment provider in 'src/modules/checkout/components/payment/index.tsx'" />
                                )}
                            </div>
                            <div className="flex flex-col w-1/3">
                                <p className="font-medium text-base mb-1">Payment details</p>
                                <div className="flex gap-2 font-normal text-base text-default-600 items-center" data-testid="payment-details-summary">
                                    <div className="shadow-lg rounded-lg flex items-center h-7 w-fit p-2 bg-default-300">
                                        {paymentInfoMap[cart.payment_session.id]?.icon || <CreditCard />}
                                    </div>
                                    <p>{"Another step will appear"}</p>
                                </div>
                            </div>
                        </div>
                    ) : paidByGiftcard ? (
                        <div className="flex flex-col w-1/3">
                            <p className="font-medium text-base mb-1">Payment method</p>
                            <p className="font-normal text-base text-default-600" data-testid="payment-method-summary">
                                Gift card
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default Payment;
