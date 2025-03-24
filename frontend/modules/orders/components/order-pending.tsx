"use client"

import FadeInComponent from "@/components/fade-in-compoent";
import { Order, PaymentStatus } from "@/lib/models";
import { ArrowRight, Clock, RefreshCcw } from "nui-react-icons";
import { useEffect, useState } from "react";
import OrderDetailsList from "./order-details2";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
  };

// Pending Payment Component
const PendingPayment: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    const [countdown, setCountdown] = useState(3600); // 1 hour in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
            <FadeInComponent>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                    <Clock className="w-8 h-8 text-yellow-600" />
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Pending</h2>
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <p className="text-gray-600 mb-4">We're waiting for your bank transfer. Please complete the payment within:</p>
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <div className="bg-yellow-50 p-4 rounded-md mb-6">
                    <div className="flex items-center justify-center">
                        <RefreshCcw className="w-5 h-5 text-yellow-600 animate-spin mr-2" />
                        <span className="text-xl font-mono font-bold text-yellow-700">{formatTime(countdown)}</span>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Transfer Details</h3>
                    <div className="text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Bank Name:</span>
                            <span className="font-medium">Example Bank</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Account Name:</span>
                            <span className="font-medium">Shop Company Ltd</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Account Number:</span>
                            <span className="font-medium">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Sort Code:</span>
                            <span className="font-medium">01-23-45</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Reference:</span>
                            <span className="font-medium">{order.order_number}</span>
                        </div>
                    </div>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="800ms">
                <OrderDetailsList orderDetails={order} />
            </FadeInComponent>

            <FadeInComponent delay="1000ms">
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

export default PendingPayment
