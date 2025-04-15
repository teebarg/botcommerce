"use client";

import { ArrowRight, Clock } from "nui-react-icons";
import { useEffect, useState } from "react";

import OrderInfo from "./order-info";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";

import FadeInComponent from "@/components/fade-in-component";
import { BankDetails, Order, PaymentStatus } from "@/types/models";
import { api } from "@/apis";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

// Pending Payment Component
const PendingPayment: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    // const [countdown, setCountdown] = useState(3600 * 24); // 1 hour in seconds
    const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);

    useEffect(() => {
        const fetchBankDetails = async () => {
            const { data, error } = await api.bank.getBankDetails("no-cache");

            if (!error) {
                setBankDetails(data || []);
            }
        };

        fetchBankDetails();
    }, []);

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    //     }, 1000);

    //     return () => clearInterval(timer);
    // }, []);

    // const formatTime = (seconds: number): string => {
    //     const hrs = Math.floor(seconds / 3600);
    //     const mins = Math.floor((seconds % 3600) / 60);
    //     const secs = seconds % 60;

    //     return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    // };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900 mb-2">Payment Pending</h2>

                    <p className="text-default-600">{`We're waiting for your bank transfer. Please complete the payment with the details below:`}</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <div className="bg-content1 rounded-xl shadow-sm p-4 mb-6">
                    <h3 className="text-lg font-medium text-default-900 mb-4">Bank Transfer Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-default-500">Bank Name</span>
                            <span className="font-medium">{bankDetails[0]?.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Account Name</span>
                            <span className="font-medium">{bankDetails[0]?.account_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Account Number</span>
                            <span className="font-medium">{bankDetails[0]?.account_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Reference</span>
                            <span className="font-medium">{order.order_number}</span>
                        </div>
                    </div>
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
                <div className="mt-6">
                    <button
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        onClick={onContinueShopping}
                    >
                        Continue Shopping
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default PendingPayment;
