import React from "react";
import { Truck, Store, Clock, MapPin, ChevronRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useDeliveryOptions } from "@/hooks/useApi";
import { currency } from "@/utils";
import { PaymentMethod, type Cart, type DeliveryOption } from "@/schemas";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { useConfig } from "@/providers/store-provider";
import { PageLoader } from "@/components/generic/page-loader";
import PickupCard from "./prickup-card";
import AddressStep from "./address-step";

interface DeliveryStepProps {
    cart: Cart;
    onComplete?: () => void;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ cart, onComplete }) => {
    console.log("🚀 ~ DeliveryStep ~ cart:", cart)
    const { address } = useConfig();
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
                            <div key={idx}>
                                <div className="flex items-center space-x-3 mb-2">
                                    {option.method === "PICKUP" ? (
                                        <Store className="h-6 w-6 text-primary" />
                                    ) : (
                                        <Truck className="h-6 w-6 text-primary" />
                                    )}
                                    <div className="text-left">
                                        <h3 className="font-semibold text-lg">
                                            {option.name} ({option.amount === 0 ? "Free" : currency(option.amount)})
                                        </h3>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground pl-9">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {option.duration}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        {option.amount === 0 ? <span>{address}</span> : <span>Available nationwide</span>}
                                    </div>
                                </div>
                            </div>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
                {cart?.shipping_method === "PICKUP" && (
                    <PickupCard />
                )}
                {["STANDARD", "EXPRESS"].includes(cart?.shipping_method ?? "") && (
                    <AddressStep address={cart.shipping_address} onComplete={() => console.log("jsjjsjs")} />
                )}
            </div>
            <div className="flex justify-end py-3 px-4 sticky bottom-0 border-t border-border bg-background mt-4">
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
