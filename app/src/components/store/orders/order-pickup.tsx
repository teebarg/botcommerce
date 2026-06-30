import { AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";

import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderNotes from "./order-notes";
import OrderNext from "./order-next";
import OrderOverview from "./order-overview";
import FadeInComponent from "@/components/generic/fade-in-component";
import type { Order } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/providers/store-provider";

type OrderConfirmationProps = {
    order: Order;
    onContinueShopping?: () => void;
};

const OrderPickup: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    const { address } = useConfig();

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 w-full">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3 animate-pulse">
                        <ShoppingBag className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-1">Pickup Order</h2>
                    <p className="text-muted-foreground text-sm">Please visit our store to complete your order.</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="50ms">
                <OrderOverview order={order} />
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <div className="rounded-xl border bg-card p-4 mb-4">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Pickup point</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Address</span>
                            <span className="font-medium">{address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Opening hours</span>
                            <span className="font-medium">Mon–Sat: 9am–6pm</span>
                        </div>
                    </div>
                </div>
            </FadeInComponent>

            {order?.payment_method === "BANK_TRANSFER" && (
                <FadeInComponent delay="150ms">
                    <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-2xl">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <span className="font-medium text-orange-900">Payment Pending</span>
                        </div>
                        <p className="text-sm text-orange-700 mb-4">
                            Your order is currently pending payment. Please complete your bank transfer using the details provided.
                        </p>
                        <div className="p-4 bg-white rounded-lg border border-orange-200">
                            <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
                            <ul className="text-sm text-gray-600 space-y-1 text-left">
                                <li>• Transfer the exact amount to our bank account</li>
                                <li>• Include your order number ({order.order_number}) in the transfer description</li>
                                <li>• We will process your order once payment is confirmed</li>
                                <li>• You will receive an email confirmation within 24 hours</li>
                            </ul>
                        </div>
                    </div>
                </FadeInComponent>
            )}

            <FadeInComponent delay="200ms">
                <OrderNotes order={order} />
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <OrderItems items={order.order_items} showDetails={false} />
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <OrderSummary order={order} />
            </FadeInComponent>

            <FadeInComponent delay="650ms">
                <OrderNext isPickup />
            </FadeInComponent>

            <FadeInComponent delay="700ms">
                <Button className="w-full mt-6 rounded-full" size="lg" onClick={onContinueShopping}>
                    Continue shopping
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </FadeInComponent>
        </div>
    );
};

export default OrderPickup;
