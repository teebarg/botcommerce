"use client";

import { RadioGroup } from "@headlessui/react";
import { CheckCircleSolid } from "nui-react-icons";
import Radio from "@modules/common/components/radio";
import Spinner from "@modules/common/icons/spinner";
import ErrorMessage from "@modules/checkout/components/error-message";
import { setShippingMethod } from "@modules/checkout/actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Button from "@modules/common/components/button";
import { Cart, DeliveryOption } from "types/global";
import { currency } from "@lib/util/util";

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
            <div className="flex flex-row items-center justify-between mb-6">
                <h2
                    className={clsx("flex flex-row text-3xl gap-x-2 items-baseline", {
                        "opacity-50 pointer-events-none select-none": !isOpen && cart.shipping_method,
                    })}
                >
                    Delivery
                    {!isOpen && cart.shipping_method?.name && <CheckCircleSolid />}
                </h2>
                {!isOpen && cart?.shipping_address && cart?.billing_address && cart?.email && (
                    <button className="text-default-700 hover:text-blue-600" data-testid="edit-delivery-button" onClick={handleEdit}>
                        Edit
                    </button>
                )}
            </div>
            {isOpen ? (
                <div data-testid="delivery-options-container">
                    <div className="pb-8">
                        <RadioGroup value={cart.shipping_method?.id} onChange={(value: string) => handleChange(value)}>
                            {availableShippingMethods ? (
                                availableShippingMethods.map((option) => {
                                    return (
                                        <RadioGroup.Option
                                            key={option.id}
                                            className={clsx(
                                                "flex items-center justify-between text-sm cursor-pointer py-4 border rounded-lg px-8 mb-2",
                                                {
                                                    "border-blue-400": option.id === cart.shipping_method?.id,
                                                }
                                            )}
                                            data-testid="delivery-option-radio"
                                            value={option.id}
                                        >
                                            <div className="flex items-center gap-x-4">
                                                <Radio checked={option.id === cart.shipping_method?.id} />
                                                <span className="text-base">{option.name}</span>
                                            </div>
                                            <span className="justify-self-end text-default-800">{currency(option.amount!)}</span>
                                        </RadioGroup.Option>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-8 text-default-800">
                                    <Spinner />
                                </div>
                            )}
                        </RadioGroup>
                    </div>

                    <ErrorMessage data-testid="delivery-option-error-message" error={error} />

                    <Button
                        className="mt-6"
                        data-testid="submit-delivery-option-button"
                        isDisabled={!cart.shipping_method}
                        isLoading={isLoading}
                        size="lg"
                        onPress={handleSubmit}
                    >
                        Continue to payment
                    </Button>
                </div>
            ) : (
                <div>
                    <div className="text-small-regular">
                        {cart && cart.shipping_method?.name && (
                            <div className="flex flex-col w-1/3">
                                <p className="font-medium mb-1 text-base">Method</p>
                                <p className="font-normal text-default-600 text-base">
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
