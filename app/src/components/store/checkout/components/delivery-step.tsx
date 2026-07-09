import React from "react";
import { Truck, Store, ChevronRight, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useDeliveryOptions } from "@/hooks/useApi";
import { currency } from "@/utils";
import { type Cart, type DeliveryOption } from "@/schemas";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { PageLoader } from "@/components/generic/page-loader";
import PickupCard from "./pickup-card";
import AddressStep from "./address-step";

interface DeliveryStepProps {
    cart: Cart;
    onComplete?: () => void;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ cart, onComplete }) => {
    const { data, isPending } = useDeliveryOptions();
    const deliveryOptions = data?.filter((item: DeliveryOption) => item.is_active);
    const updateCartDetails = useUpdateCartDetails();
    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = React.useState<DeliveryOption | null>(null);

    const handleChange = (value: string) => {
        const item: DeliveryOption | undefined = deliveryOptions?.find((item: DeliveryOption) => item.method == value);

        if (!item) {
            return;
        }
        setSelectedDeliveryMethod(item);
        updateCartDetails.mutate({ shipping_method: item.method, shipping_fee: item.amount });
    };

    const handleContinue = () => {
        if (cart.shipping_method && onComplete) {
            onComplete();
        }
    };

    const canContinue = cart.shipping_method == "PICKUP" || (Boolean(cart.shipping_method) && Boolean(cart.shipping_address));

    if (isPending) {
        return <PageLoader variant="radio" rows={4} className="px-4" />;
    }

    return (
        <>
            <div className="space-y-4 px-4 flex-1 slide-in overflow-auto">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold">Choose Delivery</h2>
                    <p className="text-muted-foreground text-sm">How would you like to receive your order?</p>
                </div>

                <RadioGroup value={cart.shipping_method} variant="delivery" onValueChange={(value: string) => handleChange(value)}>
                    {deliveryOptions?.map((option, idx: number) => (
                        <RadioGroupItem
                            key={idx}
                            loading={updateCartDetails.isPending && selectedDeliveryMethod === option}
                            value={option.method}
                            variant="delivery"
                        >
                            <div key={idx} className="flex items-center space-x-3 w-full">
                                {option.method === "PICKUP" ? (
                                    <Store className="h-5 w-5" />
                                ) : option.method === "EXPRESS" ? (
                                    <Zap className="h-5 w-5" />
                                ) : (
                                    <Truck className="h-5 w-5" />
                                )}
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-md">
                                        {option.name}
                                    </h3>
                                    <p className="text-muted-foreground text-xs">{option.duration}</p>
                                </div>
                                <p className="font-semibold">
                                    {option.amount === 0 ? "Free" : currency(option.amount)}
                                </p>
                            </div>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
                {cart?.shipping_method === "PICKUP" && (
                    <PickupCard />
                )}
                {["STANDARD", "EXPRESS"].includes(cart?.shipping_method ?? "") && (
                    <AddressStep address={cart.shipping_address} />
                )}
            </div>
            <div className="sheet-footer sticky bottom-0">
                <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={updateCartDetails.isPending || !canContinue}
                    isLoading={updateCartDetails.isPending}
                    className="rounded-full text-sm font-semibold w-full md:w-auto md:px-10"
                >
                    Continue to payment
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
};

export default DeliveryStep;
