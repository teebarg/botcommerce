"use client";

import { Delivery, Pencil } from "nui-react-icons";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { currency } from "@/lib/utils";
import { Cart, DeliveryOption } from "@/schemas";
import { useDeliveryOptions } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";
import { RadioGroupItem, RadioGroupWithLabel } from "@/components/ui/radio-group";

type ShippingProps = {
    cart: Omit<Cart, "refundable_amount">;
};

const Shipping: React.FC<ShippingProps> = ({ cart }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const updateCartDetails = useUpdateCartDetails();

    const { data: deliveryOptions } = useDeliveryOptions();

    const selectedShippingMethod: DeliveryOption | undefined = deliveryOptions?.find((item: DeliveryOption) => item.method == cart?.shipping_method);

    const isOpen = searchParams.get("step") === "delivery";

    const hasShippingMethod = !!cart.shipping_method;

    const handleEdit = () => {
        router.push(pathname + "?step=delivery", { scroll: false });
    };

    const handleSubmit = () => {
        router.push(pathname + "?step=payment", { scroll: false });
    };

    const handleChange = (value: string) => {
        const item: DeliveryOption | undefined = deliveryOptions?.find((item: DeliveryOption) => item.method == value);

        if (!item) {
            return;
        }
        updateCartDetails.mutate({ shipping_method: item.method, shipping_fee: item.amount });
    };

    return (
        <div
            className={cn(
                "bg-content1 shadow-md p-6 rounded border-l-2",
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
                    className={cn("text-blue-500 items-center gap-2 text-sm hidden cursor-pointer", !isOpen && cart?.shipping_method && "flex")}
                    onClick={handleEdit}
                >
                    Edit <Pencil />
                </button>
            </div>

            <div className={cn("mt-6", isOpen ? "block" : "hidden")} data-testid="delivery-options-container">
                <RadioGroupWithLabel
                    className="grid grid-cols-1 md:grid-cols-3 gap-2"
                    label="How do you want to receive your order?"
                    value={cart.shipping_method}
                    variant="card"
                    onValueChange={(value: string) => handleChange(value)}
                >
                    {deliveryOptions?.map((option, idx: number) => (
                        <RadioGroupItem key={idx} value={option.method} variant="card">
                            <div className="text-left">
                                <div className="font-medium">
                                    {option.name} ({option.amount === 0 ? "Free" : currency(option.amount)})
                                </div>
                                <div className="text-sm text-default-500">{option.description}</div>
                            </div>
                        </RadioGroupItem>
                    ))}
                </RadioGroupWithLabel>
                <Button
                    className="font-semibold mt-2"
                    data-testid="shipping-method-button"
                    disabled={!hasShippingMethod}
                    isLoading={updateCartDetails.isPending}
                    size="sm"
                    variant="primary"
                    onClick={handleSubmit}
                >
                    Continue to payment
                </Button>
            </div>

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
