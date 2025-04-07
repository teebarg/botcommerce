"use client";

import { AlertCircle, CreditCard } from "nui-react-icons";

import OrderInfo from "./order-info";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";

import { Order, PaymentStatus } from "@/types/models";
import FadeInComponent from "@/components/fade-in-component";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

// Failed Payment Component
const FailedPayment: React.FC<OrderConfirmationProps> = ({ order, onRetry, onContinueShopping }) => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 animate-pulse">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900 mb-2">Payment Failed</h2>

                    <p className="text-default-600">We were unable to process your payment. Please check your payment details and try again.</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <div className="bg-content1 rounded-xl shadow-sm p-4 mb-6">
                    <h3 className="font-medium text-red-800 mb-3">Possible Reasons</h3>
                    <ul className="space-y-2 text-red-700 text-sm">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Insufficient funds in your account</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Card expired or invalid details</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Transaction declined by your bank</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Technical error during processing</span>
                        </li>
                    </ul>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="300ms">
                <OrderInfo order={order} />
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <OrderItems items={order.order_items} showDetails={false} />
            </FadeInComponent>

            <FadeInComponent delay="500ms">
                <OrderAddress order={order} />
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <OrderSummary order={order} />
            </FadeInComponent>

            <FadeInComponent delay="700ms">
                <div className="mt-6 space-y-3">
                    <button
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        onClick={onRetry}
                    >
                        <CreditCard className="mr-2 w-5 h-5" />
                        Try Payment Again
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

export default FailedPayment;
