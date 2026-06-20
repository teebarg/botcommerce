import { ArrowRight, Check } from "lucide-react";

import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";
import OrderNotes from "./order-notes";
import OrderNext from "./order-next";
import OrderOverview from "./order-overview";
import type { Order } from "@/schemas";
import FadeInComponent from "@/components/generic/fade-in-component";
import { Button } from "@/components/ui/button";

type OrderConfirmationProps = {
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

const SuccessConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 w-full">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3 animate-pulse">
                        <Check className="w-5 h-5 text-emerald-700" />
                    </div>

                    <h2 className="text-xl font-semibold mb-1">Order Confirmed!</h2>
                    <p className="text-muted-foreground text-sm">{`Thank you for your purchase. We've sent a confirmation to ${order.email}.`}</p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <OrderOverview order={order} />
            </FadeInComponent>

            <FadeInComponent delay="200ms">
                <OrderNotes order={order} />
            </FadeInComponent>

            <FadeInComponent delay="300ms">
                <OrderItems items={order.order_items} showDetails={true} />
            </FadeInComponent>

            <FadeInComponent delay="400ms">
                <OrderAddress order={order} />
            </FadeInComponent>

            <FadeInComponent delay="500ms">
                <OrderSummary order={order} />
            </FadeInComponent>

            <FadeInComponent delay="600ms">
                <OrderNext />
            </FadeInComponent>

            <FadeInComponent delay="650ms">
                <Button className="w-full mt-6 rounded-full" size="lg" onClick={onContinueShopping}>
                    Continue shopping
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </FadeInComponent>
        </div>
    );
};

export default SuccessConfirmation;
