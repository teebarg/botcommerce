"use client";

import { AlertCircle, ArrowRight, Clock } from "lucide-react";

import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";
import OrderNotes from "./order-notes";
import OrderNext from "./order-next";
import OrderOverview from "./order-overview";

import FadeInComponent from "@/components/generic/fade-in-component";
import { Order } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useBankDetails } from "@/lib/hooks/useApi";

type OrderConfirmationProps = {
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

const PendingPayment: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    const { data: bankDetails } = useBankDetails();

    return (
        <div className="w-full max-w-3xl mx-auto rounded-xl px-2 md:px-6 py-4">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4 animate-pulse">
                        <Clock className="w-12 h-12 text-orange-600" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Payment Pending</h2>

                    <p className="text-muted-foreground">{`We're waiting for your payment. Please complete the payment with the details below:`}</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="50ms">
                <OrderOverview order={order} />
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <div className="bg-secondary rounded-xl shadow-sm p-4 mb-6 mt-4">
                    <h3 className="text-lg font-medium mb-4">Bank Transfer Details</h3>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Bank Name</span>
                            <span className="font-medium">{bankDetails?.[0]?.bank_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Account Name</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Account Number</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_number}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Reference</span>
                            <span className="font-medium">{order.order_number}</span>
                        </div>
                    </div>
                </div>
            </FadeInComponent>

            {order?.payment_method === "BANK_TRANSFER" && (
                <FadeInComponent delay="200ms">
                    <div className="mb-8 p-6 bg-gradient-to-r from-secondary/20 to-accent/20 border border-orange-200 rounded-2xl">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-accent" />
                            <span className="font-medium text-accent">Payment Pending</span>
                        </div>
                        <p className="text-sm text-accent mb-4">
                            Your order is currently pending payment. Please complete your bank transfer using the details provided.
                        </p>
                        <div className="p-4 bg-secondary rounded-lg">
                            <h4 className="font-medium mb-2">Next Steps:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 text-left">
                                <li>• Transfer the exact amount to our bank account</li>
                                <li>• Include your order number ({order.order_number}) in the transfer description</li>
                                <li>• We will process your order once payment is confirmed</li>
                                <li>• You will receive an email confirmation within 24 hours</li>
                            </ul>
                        </div>
                    </div>
                </FadeInComponent>
            )}

            <FadeInComponent delay="300ms">
                <OrderNotes order={order} />
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

            <FadeInComponent delay="650ms">
                <OrderNext isPickup />
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
