"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Pencil } from "nui-react-icons";
import { paymentInfoMap } from "@lib/constants";
import { toast } from "sonner";
import { CreditCardIcon } from "lucide-react";

import PaymentContainer from "../payment-container";
import ErrorMessage from "../error-message";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Cart, PaymentMethod } from "@/schemas";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";

const payMethods: { id: string; provider_id: PaymentMethod }[] = [
    { id: "pickup", provider_id: "CASH_ON_DELIVERY" },
    { id: "manual", provider_id: "BANK_TRANSFER" },
    { id: "paystack", provider_id: "PAYSTACK" },
];

const Payment = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null }) => {
    const invalidate = useInvalidate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get("step") === "payment";

    const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

    const hasPaymentMethod = !!cart?.payment_method && !!cart?.shipping_method;

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams);

            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );

    const set = async (providerId: PaymentMethod) => {
        setIsLoading(true);

        const { error } = await api.cart.updateDetails({ payment_method: providerId });

        if (error) {
            toast.error(error);

            return;
        }
        invalidate("checkout-cart");

        setIsLoading(false);
    };

    const handleChange = (providerId: PaymentMethod) => {
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
                "bg-content1 shadow-md p-6 rounded border-l-2",
                isOpen || hasPaymentMethod ? "border-l-indigo-500" : "border-l-content3 opacity-50"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 bg-gray-500 rounded-full", { "bg-blue-500": isOpen || hasPaymentMethod })} />
                    <span className="font-medium">Payment Method</span>
                    <CreditCardIcon className="w-5 h-5 text-blue-500" />
                </div>
                <button
                    aria-label="edit"
                    className={cn("text-blue-500 items-center gap-2 text-sm hidden", !isOpen && cart?.shipping_method && "flex")}
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
                    <RadioGroup name="payment" value={cart?.payment_method || ""} onChange={(value: string) => handleChange(value as PaymentMethod)}>
                        {payMethods.map((item: { id: string; provider_id: PaymentMethod }, idx: number) => (
                            <PaymentContainer
                                key={idx}
                                paymentInfoMap={paymentInfoMap}
                                paymentSession={item}
                                selectedPaymentOptionId={cart?.payment_method || null}
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
                    variant="primary"
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
                        {paymentInfoMap[cart.payment_method]?.title || cart.payment_method}
                        <br />
                        {paymentInfoMap[cart.payment_method]?.description}
                    </p>
                    <div className="shadow-lg rounded-lg flex items-center h-7 w-fit p-2 bg-default-100">
                        {paymentInfoMap[cart.payment_method]?.icon || <CreditCard />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
