"use client"

import FadeInComponent from "@/components/fade-in-compoent";
import { Order, PaymentStatus } from "@/lib/models";
import { ArrowRight, Check } from "nui-react-icons";
import OrderDetailsList from "./order-details2";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
  };

// Success Confirmation Component
const SuccessConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
            <FadeInComponent>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <p className="text-gray-600 mb-8">Thank you for your order. We've received your payment and are preparing your items for shipment.</p>
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <OrderDetailsList order={order} />
            </FadeInComponent>

            <FadeInComponent delay="800ms">
                <div className="flex flex-col space-y-4 mt-8">
                    <button
                        onClick={onContinueShopping}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                        Continue Shopping
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default SuccessConfirmation;
