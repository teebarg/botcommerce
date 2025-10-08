"use client";

import { Check } from "lucide-react";

import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";
import OrderNotes from "./order-notes";
import OrderNext from "./order-next";
import OrderOverview from "./order-overview";

import { Order } from "@/schemas";
import FadeInComponent from "@/components/generic/fade-in-component";
import { Button } from "@/components/ui/button";

type OrderConfirmationProps = {
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

const SuccessConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    return (
        <div className="w-full max-w-3xl mx-auto rounded-xl px-2 md:px-6 py-6 md:py-12">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4 animate-pulse">
                        <Check className="w-12 h-12 text-emerald-700" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>

                    <p className="text-muted-foreground">{`Thank you for your purchase. We've sent a confirmation to ${order.email}.`}</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <OrderOverview order={order} />
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <OrderNotes order={order} />
            </FadeInComponent>

            <FadeInComponent delay="300ms">
                <OrderItems items={order.order_items} showDetails={true} />
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <OrderAddress order={order} />
            </FadeInComponent>

            <FadeInComponent delay="500ms">
                <OrderSummary order={order} />
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <OrderNext />
            </FadeInComponent>

            <FadeInComponent delay="650ms">
                <div className="mt-6 space-y-3">
                    <Button className="w-full" size="lg" onClick={onContinueShopping}>
                        Continue Shopping
                    </Button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default SuccessConfirmation;
