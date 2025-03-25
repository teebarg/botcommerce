"use client";

import { ArrowRight } from "nui-react-icons";
import { Check } from "lucide-react";

import OrderInfo from "./order-info";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";

import { Order, PaymentStatus } from "@/lib/models";
import FadeInComponent from "@/components/fade-in-component";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

// Success Confirmation Component
const SuccessConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Check className="w-8 h-8 text-green-600" />
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
                <OrderSummary order={order} />
            </FadeInComponent>

            <FadeInComponent delay="500ms">
                <div className="mt-6 space-y-3">
                    <button
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        onClick={() => {}}
                    >
                        Track Your Order
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </button>

                    <button
                        className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        onClick={onContinueShopping}
                    >
                        Continue Shopping
                    </button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default SuccessConfirmation;
