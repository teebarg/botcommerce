import React from "react";
import { Truck, Store, Clock, MapPin, ChevronRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useDeliveryOptions } from "@/hooks/useApi";
import { currency } from "@/utils";
import type { Cart, DeliveryOption } from "@/schemas";
import { useUpdateCartDetails } from "@/hooks/useCart";
import { useConfig } from "@/providers/store-provider";
import ComponentLoader from "@/components/component-loader";
import { motion } from "framer-motion";

interface DeliveryStepProps {
    cart: Cart;
    onComplete?: () => void;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ cart, onComplete }) => {
    const { config } = useConfig();
    const { data: deliveryOptions, isPending } = useDeliveryOptions();
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

    const canContinue = !!cart.shipping_method;

    if (isPending) {
        return <ComponentLoader className="h-48" />;
    }

    return (
        <>
            <div className="space-y-4 px-4 flex-1">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Choose Delivery</h2>
                    <p className="text-muted-foreground">How would you like to receive your order?</p>
                </motion.div>

                <RadioGroup value={cart.shipping_method} variant="delivery" onValueChange={(value: string) => handleChange(value)}>
                    {deliveryOptions?.map((option, idx: number) => (
                        <RadioGroupItem
                            key={idx}
                            loading={updateCartDetails.isPending && selectedDeliveryMethod === option}
                            value={option.method}
                            variant="delivery"
                        >
                            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
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
                                        {option.amount === 0 ? <span>{config?.address}</span> : <span>Available nationwide</span>}
                                    </div>
                                </div>
                            </motion.div>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
            </div>
            <div className="flex justify-end py-2 sticky px-4 bottom-0 border-t md:border-t-0 bg-background mt-4">
                <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={updateCartDetails.isPending || !canContinue}
                    className="bg-gradient-action shadow-glow hover:opacity-90 transition-opacity h-14 rounded-2xl text-base font-semibold w-full md:w-sm"
                >
                    Continue
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </>
    );
};

export default DeliveryStep;
