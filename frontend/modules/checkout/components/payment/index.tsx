"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ErrorMessage from "@modules/checkout/components/error-message";
import { CreditCard, Pencil } from "nui-react-icons";
import PaymentContainer from "@modules/checkout/components/payment-container";
import { setPaymentMethod } from "@modules/checkout/actions";
import { paymentInfoMap } from "@lib/constants";
import { Cart, PaymentSession } from "types/global";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";

const payMethods = [
    { id: "stripe", provider_id: "stripe" },
    { id: "manual", provider_id: "manual" },
    { id: "paystack", provider_id: "paystack" },
];

const Payment = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get("step") === "payment";

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const hasPaymentMethod = !!cart?.payment_session?.id && !!cart?.shipping_method?.id;

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
        const method = payMethods.find((item) => item.provider_id == providerId);

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
        <div
            className={cn(
                "bg-content1 shadow-medium p-6 rounded border-l-2",
                isOpen || hasPaymentMethod ? "border-l-indigo-500" : "border-l-content3 opacity-50"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 bg-gray-500 rounded-full", { "bg-blue-500": isOpen || hasPaymentMethod })}></div>
                    <span className="font-medium">Payment Method</span>
                </div>
                <button
                    aria-label="edit"
                    className={cn("text-blue-500 items-center gap-2 text-sm hidden", !isOpen && cart?.shipping_method?.id && "flex")}
                    onClick={handleEdit}
                >
                    Edit <Pencil />
                </button>
            </div>

            {/* Form */}
            <div className={isOpen ? "block mt-4" : "hidden"}>
                <div className={cn("hidden flex-col w-1/3", { flex: paidByGiftcard })}>
                    <p className="font-medium text-base mb-1">Payment method</p>
                    <p className="font-normal text-base text-default-500" data-testid="payment-method-summary">
                        Gift card
                    </p>
                </div>
                {!paidByGiftcard && (
                    <RadioGroup name="payment" value={cart?.payment_session?.provider_id || ""} onChange={(value: string) => handleChange(value)}>
                        {payMethods.map((item) => (
                            <PaymentContainer
                                key={item.id}
                                paymentInfoMap={paymentInfoMap}
                                paymentSession={item}
                                selectedPaymentOptionId={cart?.payment_session?.provider_id || null}
                            />
                        ))}
                    </RadioGroup>
                )}

                <ErrorMessage data-testid="payment-method-error-message" error={error} />

                <Button
                    className="mt-4 font-semibold"
                    data-testid="submit-payment-button"
                    disabled={!hasPaymentMethod && !paidByGiftcard}
                    isLoading={isLoading}
                    size="sm"
                    onClick={handleSubmit}
                >
                    Continue to review
                </Button>
            </div>

            {/* Payment Method Section */}
            {!isOpen && hasPaymentMethod && (
                <div className="text-xs md:text-sm mt-6" data-testid="payment-method-summary">
                    <p className="font-medium mb-1 text-base">Payment method</p>
                    <p className="font-normal text-default-500 text-xs md:text-sm">
                        {paymentInfoMap[cart.payment_session.id]?.title || cart.payment_session.provider_id}
                        <br />
                        {paymentInfoMap[cart.payment_session.id]?.description}
                    </p>
                    <div className="shadow-lg rounded-lg flex items-center h-7 w-fit p-2 bg-default-100">
                        {paymentInfoMap[cart.payment_session.id]?.icon || <CreditCard />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
