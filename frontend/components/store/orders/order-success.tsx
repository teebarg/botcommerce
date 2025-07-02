"use client";

import { Check } from "lucide-react";

import OrderInfo from "./order-info";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";

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
        <div className="w-full max-w-2xl mx-auto">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                        <Check className="w-8 h-8 text-emerald-700" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900 mb-2">Order Confirmed!</h2>

                    <p className="text-default-600">{`Thank you for your purchase. We've sent a confirmation to ${order.email}.`}</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <OrderInfo order={order} />
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
                <div className="mt-6 space-y-3">
                    {/* <Button className="w-full px-6 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => {}}>
                        Track Your Order
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button> */}

                    <Button className="w-full" size="lg" variant="primary" onClick={onContinueShopping}>
                        Continue Shopping
                    </Button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default SuccessConfirmation;
