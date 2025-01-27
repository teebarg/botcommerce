"use client";

import { CheckCircleSolid } from "nui-react-icons";
import ErrorMessage from "@modules/checkout/components/error-message";
import { setShippingMethod } from "@modules/checkout/actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cart, DeliveryOption } from "types/global";
import { currency } from "@lib/util/util";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";

type ShippingProps = {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">;
    availableShippingMethods: any[] | null;
};

const Shipping: React.FC<ShippingProps> = ({ cart, availableShippingMethods }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get("step") === "delivery";

    const handleEdit = () => {
        router.push(pathname + "?step=delivery", { scroll: false });
    };

    const handleSubmit = () => {
        setIsLoading(true);
        router.push(pathname + "?step=payment", { scroll: false });
    };

    const set = async (option: DeliveryOption) => {
        setIsLoading(true);
        await setShippingMethod(option)
            .then(() => {
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.toString());
                setIsLoading(false);
            });
    };

    const handleChange = (value: string) => {
        const item: DeliveryOption = availableShippingMethods?.find((item: DeliveryOption) => item.id == value);

        set(item);
    };

    useEffect(() => {
        setIsLoading(false);
        setError(null);
    }, [isOpen]);

    return (
        <div>
            <div className="flex flex-row items-center justify-between mb-2">
                <h2
                    className={cn("flex flex-row text-lg font-bold gap-x-2 items-baseline", {
                        "opacity-50 pointer-events-none select-none": !isOpen && !cart.shipping_method,
                    })}
                >
                    Choose a Delivery Option
                    {!isOpen && cart.shipping_method?.name && <CheckCircleSolid className="text-success" />}
                </h2>
                {!isOpen && cart?.shipping_address && cart?.billing_address && cart?.email && (
                    <button
                        aria-label="edit"
                        className="text-default-900 hover:text-blue-600"
                        data-testid="edit-delivery-button"
                        onClick={handleEdit}
                    >
                        Edit
                    </button>
                )}
            </div>
            {isOpen ? (
                <div data-testid="delivery-options-container">
                    <RadioGroup
                        className="grid grid-cols-1 md:grid-cols-3 gap-2"
                        name="shipping-method"
                        value={cart.shipping_method?.id}
                        onChange={(value: string) => handleChange(value)}
                    >
                        {availableShippingMethods?.map((option) => (
                            <RadioGroup.Option
                                key={option.id}
                                className={cn(
                                    `flex items-center justify-between px-4 py-4 md:px-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        option.id === cart.shipping_method?.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`,
                                    option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
                                )}
                                value={option.id}
                            >
                                <div>
                                    <h3
                                        className={`text-sm font-medium ${
                                            option.id === cart.shipping_method?.id ? "text-blue-600" : "text-gray-800"
                                        }`}
                                    >
                                        {option.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{option.description}</p>
                                </div>
                                <span
                                    className={`text-sm font-semibold ${option.id === cart.shipping_method?.id ? "text-blue-600" : "text-gray-800"}`}
                                >
                                    {option.amount}
                                </span>
                            </RadioGroup.Option>
                        ))}
                    </RadioGroup>

                    <ErrorMessage data-testid="delivery-option-error-message" error={error} />

                    <Button
                        className="font-semibold mt-2"
                        data-testid="submit-delivery-option-button"
                        disabled={!cart.shipping_method}
                        isLoading={isLoading}
                        size="sm"
                        onClick={handleSubmit}
                    >
                        Continue to payment
                    </Button>
                </div>
            ) : (
                <div>
                    <div className="text-sm">
                        {cart && cart.shipping_method?.name && (
                            <div className="flex flex-col w-1/3">
                                <p className="font-medium mb-1 text-base">Method</p>
                                <p className="font-normal text-default-500 text-xs md:text-base">
                                    {cart.shipping_method?.name} ({currency(cart.shipping_method.amount)})
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default Shipping;
