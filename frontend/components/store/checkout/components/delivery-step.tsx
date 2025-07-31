import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Store, Clock, MapPin } from "lucide-react";
import { useDeliveryOptions } from "@/lib/hooks/useApi";
import { currency } from "@/lib/utils";
import { DeliveryOption } from "@/schemas";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";
import { Cart } from "@/schemas";

interface DeliveryStepProps {
    onDeliverySelected: (type: "shipping" | "pickup") => void;
    cart: Cart;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ onDeliverySelected, cart }) => {
    const [selectedDelivery, setSelectedDelivery] = React.useState<"shipping" | "pickup" | null>(null);
    const { data: deliveryOptions } = useDeliveryOptions();
    const updateCartDetails = useUpdateCartDetails();

    const handleContinue = () => {
        if (selectedDelivery) {
            onDeliverySelected(selectedDelivery);
        }
    };

    const handleChange = (value: string) => {
        const item: DeliveryOption | undefined = deliveryOptions?.find((item: DeliveryOption) => item.method == value);

        if (!item) {
            return;
        }
        updateCartDetails.mutate({ shipping_method: item.method, shipping_fee: item.amount });
    };

    return (
        <Card className="w-full max-w-2xl shadow-elegant animate-fade-in">
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
                                    <div>
                                        <h3 className="font-semibold text-lg text-left">
                                            {option.name} ({option.amount === 0 ? "Free" : currency(option.amount)})
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground pl-9">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        {option.amount === 0 ? <span>Ready in 2-4 hours</span> : <span>3-5 business days</span>}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        {option.amount === 0 ? <span>123 Fashion Ave, Style City, SC 12345</span> : <span>Available nationwide</span>}
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

                <div className="flex justify-center pt-4">
                    <Button onClick={handleContinue} disabled={!selectedDelivery} variant="luxury" size="lg" className="px-12">
                        Continue
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DeliveryStep;
