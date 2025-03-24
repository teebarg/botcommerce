"use client"

import FadeInComponent from "@/components/fade-in-compoent";
import { Order, PaymentStatus } from "@/lib/models";
import { AlertCircle, CreditCard } from "nui-react-icons";
import OrderDetailsList from "./order-details2";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
  };

// Failed Payment Component
const FailedPayment: React.FC<OrderConfirmationProps> = ({ order, onRetry, onContinueShopping }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
            <FadeInComponent>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 animate-pulse">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <p className="text-gray-600 mb-6">We were unable to process your payment. Please check your payment details and try again.</p>
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <div className="bg-red-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-medium text-red-800 mb-4">Possible Reasons</h3>
                    <ul className="text-left space-y-2 text-red-700">
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

            <FadeInComponent delay="800ms">
                <OrderDetailsList orderDetails={order} />
            </FadeInComponent>

            <FadeInComponent delay="1000ms">
                <div className="flex flex-col space-y-4 mt-8">
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                        <CreditCard className="mr-2 w-5 h-5" />
                        Try Payment Again
                    </button>
                    <button
                        onClick={onContinueShopping}
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default FailedPayment
