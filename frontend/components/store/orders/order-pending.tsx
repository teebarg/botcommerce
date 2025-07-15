"use client";

import { ArrowRight, Clock } from "nui-react-icons";

import OrderInfo from "./order-info";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";

import FadeInComponent from "@/components/generic/fade-in-component";
import { Order } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useBankDetails } from "@/lib/hooks/useApi";
import OrderNotes from "./order-notes";

type OrderConfirmationProps = {
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

const PendingPayment: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    const { data: bankDetails } = useBankDetails();

    return (
        <div className="w-full max-w-3xl mx-auto bg-content2 rounded-xl px-2 md:px-6 py-6 md:py-12">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900 mb-2">Payment Pending</h2>

                    <p className="text-default-600">{`We're waiting for your bank transfer. Please complete the payment with the details below:`}</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <div className="bg-card rounded-xl shadow-sm p-4 mb-6 mt-4">
                    <h3 className="text-lg font-medium text-default-900 mb-4">Bank Transfer Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-default-500">Bank Name</span>
                            <span className="font-medium">{bankDetails?.[0]?.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Account Name</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Account Number</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Reference</span>
                            <span className="font-medium">{order.order_number}</span>
                        </div>
                    </div>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <OrderNotes order={order} />
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
                    <Button className="w-full" size="lg" variant="primary" onClick={onContinueShopping}>
                        Continue Shopping
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </FadeInComponent>
        </div>
    );
};

export default PendingPayment;
