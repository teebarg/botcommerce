"use client";

import { Delivery, Pencil } from "nui-react-icons";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ErrorMessage from "../error-message";

import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { currency } from "@/lib/util/util";
import { Cart, DeliveryOption } from "@/types/models";
import { useInvalidateCart } from "@/lib/hooks/useCart";

type ShippingProps = {
    cart: Omit<Cart, "refundable_amount">;
    availableShippingMethods: DeliveryOption[] | null;
};

const Shipping: React.FC<ShippingProps> = ({ cart, availableShippingMethods }) => {
    const invalidateCart = useInvalidateCart();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasShippingMethod = !!cart?.shipping_method;

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const selectedShippingMethod: DeliveryOption | undefined = availableShippingMethods?.find(
        (item: DeliveryOption) => item.id == cart?.shipping_method
    );

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
        const { error } = await api.cart.updateDetails({ shipping_method: option.id, shipping_fee: option.amount });

        if (error) {
            toast.error(error);

            return;
        }
        invalidateCart();

        setIsLoading(false);
    };

    const handleChange = (value: string) => {
        const item: DeliveryOption | undefined = availableShippingMethods?.find((item: DeliveryOption) => item.id == value);

        if (!item) {
            return;
        }

        set(item);
    };

    useEffect(() => {
        setIsLoading(false);
        setError(null);
    }, [isOpen]);

    return (
        <div
            className={cn(
                "bg-content1 shadow-medium p-6 rounded border-l-2",
                isOpen || hasShippingMethod ? "border-l-indigo-500" : "border-l-content3 opacity-50"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 bg-default-500 rounded-full", { "bg-blue-500": isOpen || hasShippingMethod })} />
                    <span className="font-medium">Delivery Option</span>
                    <Delivery className="w-5 h-5 text-blue-500" />
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
            <div className={cn("mt-6", isOpen ? "block" : "hidden")} data-testid="delivery-options-container">
                <RadioGroup
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                    name="shipping-method"
                    value={cart.shipping_method}
                    onChange={(value: string) => handleChange(value)}
                >
                    {availableShippingMethods?.map((option) => (
                        <RadioGroup.Option
                            key={option.id}
                            className={cn(
                                `flex items-center justify-between px-4 py-4 md:px-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    option.id === cart.shipping_method
                                        ? "border-blue-500 bg-transparent"
                                        : "border-default-300 hover:border-default-400"
                                }`
                                // option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
                            )}
                            value={option.id}
                        >
                            <div>
                                <h3 className={`text-sm font-medium ${option.id === cart.shipping_method ? "text-blue-600" : "text-default-700"}`}>
                                    {option.name}
                                </h3>
                                <p className="text-sm text-default-500">{option.description}</p>
                            </div>
                            <span
                                className={`text-sm font-semibold ml-2 ${option.id === cart.shipping_method ? "text-blue-600" : "text-default-800"}`}
                            >
                                {option.amount == 0 ? "Free" : currency(option.amount)}
                            </span>
                        </RadioGroup.Option>
                    ))}
                </RadioGroup>

                <ErrorMessage data-testid="delivery-option-error-message" error={error} />

                <Button
                    className="font-semibold mt-2"
                    data-testid="shipping-method-button"
                    disabled={!hasShippingMethod}
                    isLoading={isLoading}
                    size="sm"
                    onClick={handleSubmit}
                >
                    Continue to payment
                </Button>
            </div>

            {/* Shipping Information Section */}
            {!isOpen && hasShippingMethod && (
                <div className="text-xs md:text-sm mt-6" data-testid="shipping-method-summary">
                    <p className="font-medium mb-1 text-base">Method</p>
                    <p className="font-normal text-default-500 text-xs md:text-sm">
                        {selectedShippingMethod?.name} ({cart?.shipping_fee == 0 ? "Free" : currency(cart?.shipping_fee)})<br />
                        {selectedShippingMethod?.description}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Shipping;
