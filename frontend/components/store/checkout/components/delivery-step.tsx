import React from "react";
import { Truck, Store, Clock, MapPin, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useDeliveryOptions } from "@/lib/hooks/useApi";
import { currency } from "@/lib/utils";
import { DeliveryOption } from "@/schemas";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";
import { Cart } from "@/schemas";
import { useStore } from "@/app/store/use-store";
import ComponentLoader from "@/components/component-loader";

interface DeliveryStepProps {
    cart: Cart;
    onComplete?: () => void;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ cart, onComplete }) => {
    const { shopSettings } = useStore();
    const { data: deliveryOptions, isPending } = useDeliveryOptions();
    const updateCartDetails = useUpdateCartDetails();

    const handleChange = (value: string) => {
        const item: DeliveryOption | undefined = deliveryOptions?.find((item: DeliveryOption) => item.method == value);

        if (!item) {
            return;
        }
        updateCartDetails.mutate({ shipping_method: item.method, shipping_fee: item.amount });
    };

    const handleContinue = () => {
        if (cart.shipping_method && onComplete) {
            onComplete();
        }
    };

    const canContinue = !!cart.shipping_method;

    if (isPending) {
        return (
            <ComponentLoader className="h-48" />
        );
    }

    return (
        <Card className="w-full shadow-elegant animate-fade-in">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold">How would you like to receive your order?</CardTitle>
                <CardDescription>Choose between home delivery or store pickup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup value={cart.shipping_method} variant="delivery" onValueChange={(value: string) => handleChange(value)}>
                    {deliveryOptions?.map((option, idx: number) => (
                        <RadioGroupItem key={idx} value={option.method} variant="delivery">
                            <div className="">
                                <div className="flex items-center space-x-3 mb-2">
                                    {option.method === "PICKUP" ? (
                                        <Store className="h-6 w-6 text-accent" />
                                    ) : (
                                        <Truck className="h-6 w-6 text-accent" />
                                    )}
                                    <div className="text-left">
                                        <h3 className="font-semibold text-lg">
                                            {option.name} ({option.amount === 0 ? "Free" : currency(option.amount)})
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground pl-9">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {option.duration}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        {option.amount === 0 ? <span>{shopSettings.address}</span> : <span>Available nationwide</span>}
                                    </div>
                                    {option.amount === 0 && (
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-accent">Free • No delivery fees</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
                {canContinue && (
                    <div className="flex justify-end pt-4">
                        <Button className="flex items-center gap-2" size="lg" variant="luxury" onClick={handleContinue}>
                            {cart.shipping_method === "PICKUP" ? "Continue to Payment" : "Continue to Address"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DeliveryStep;
