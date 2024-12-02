"use client";

import { CheckCircleSolid, StarIcon } from "nui-react-icons";
import ErrorMessage from "@modules/checkout/components/error-message";
import { setShippingMethod } from "@modules/checkout/actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Button from "@modules/common/components/button";
import { Cart, DeliveryOption } from "types/global";
import { currency } from "@lib/util/util";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/util/cn";

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
                    <button className="text-default-900 hover:text-blue-600" data-testid="edit-delivery-button" onClick={handleEdit}>
                        Edit
                    </button>
                )}
            </div>
            {isOpen ? (
                <div data-testid="delivery-options-container">
                    <div className="pb-8">
                        <RadioGroup name="shipping-method" value={cart.shipping_method?.id} onChange={(value: string) => handleChange(value)}>
                            {availableShippingMethods?.map((option) => (
                                <RadioGroup.Option
                                    key={option.id}
                                    className={cn(
                                        "group relative transition-all",
                                        option.id === cart.shipping_method?.id && "border-primary bg-primary/10",
                                        option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
                                    )}
                                    value={option.id}
                                >
                                    <span className="absolute right-8 top-4 flex h-5 w-5 items-center justify-center rounded-full border">
                                        <span
                                            className={cn(
                                                "h-2.5 w-2.5 rounded-full bg-primary transition-all",
                                                option.id === cart.shipping_method?.id ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                            )}
                                        />
                                    </span>
                                    <div className="flex items-start gap-4">
                                        {
                                            <StarIcon
                                                className={cn(
                                                    "h-5 w-5 transition-colors",
                                                    option.id === cart.shipping_method?.id ? "text-primary" : "text-muted-foreground"
                                                )}
                                            />
                                        }
                                        <div className="space-y-1">
                                            <p className={cn("font-medium leading-none", option.id === cart.shipping_method?.id && "text-primary")}>
                                                {option.name}
                                            </p>
                                            {option.amount && <p className="text-sm text-muted-foreground">{currency(option.amount)}</p>}
                                        </div>
                                    </div>
                                </RadioGroup.Option>
                            ))}
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
                                <p className="font-normal text-default-500 text-base">
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
