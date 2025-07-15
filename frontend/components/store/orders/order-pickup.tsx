"use client";

import { ArrowRight } from "nui-react-icons";
import { ShoppingBag } from "lucide-react";

import OrderInfo from "./order-info";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";

import FadeInComponent from "@/components/generic/fade-in-component";
import { Order } from "@/schemas";
import { useStore } from "@/app/store/use-store";
import { Button } from "@/components/ui/button";
import OrderNotes from "./order-notes";

type OrderConfirmationProps = {
    order: Order;
    onContinueShopping?: () => void;
};

const OrderPickup: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    const { shopSettings } = useStore();

    return (
        <div className="w-full max-w-3xl mx-auto bg-content2 rounded-xl px-6 py-12">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                        <ShoppingBag className="w-8 h-8 text-yellow-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900">Pickup Order</h2>

                    <p className="text-default-600">Please visit our store to complete your order.</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
                    <h3 className="text-lg font-medium text-default-900 mb-4">Collection Point</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-default-500">Address</span>
                            <span className="font-medium">{shopSettings?.address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-default-500">Opening Hours</span>
                            <span className="font-medium">Mon-Sat: 9am - 6pm</span>
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

export default OrderPickup;
