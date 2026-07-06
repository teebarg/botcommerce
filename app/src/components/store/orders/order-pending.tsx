import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import OrderItems from "./order-items";
import OrderSummary from "./order-summary";
import OrderAddress from "./order-address";
import OrderNotes from "./order-notes";
import OrderNext from "./order-next";
import OrderOverview from "./order-overview";
import FadeInComponent from "@/components/generic/fade-in-component";
import type { Order } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useBankDetails } from "@/hooks/useApi";

type OrderConfirmationProps = {
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
};

const PendingPayment: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
    const { data: bankDetails } = useBankDetails();

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 w-full">
            <FadeInComponent>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold mb-1">Payment pending</h1>
                    <p className="text-muted-foreground text-sm">
                        {`We're waiting for your payment. Please complete the transfer using the details below.`}
                    </p>
                </div>
            </FadeInComponent>

            <FadeInComponent delay="50ms">
                <OrderOverview order={order} />
            </FadeInComponent>

            <FadeInComponent delay="100ms">
                <div className="rounded-xl border bg-card p-4 mb-4">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Bank transfer details</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank name</span>
                            <span className="font-medium">{bankDetails?.[0]?.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account name</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account number</span>
                            <span className="font-medium">{bankDetails?.[0]?.account_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Reference</span>
                            <span className="font-medium">{order.order_number}</span>
                        </div>
                    </div>
                </div>
            </FadeInComponent>

            {order?.payment_method === "BANK_TRANSFER" && (
                <FadeInComponent delay="200ms">
                    <div className="rounded-xl border bg-card p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium text-accent">Next steps</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 pl-1">
                            <li>· Transfer the exact amount to our bank account</li>
                            <li>· Include order number {order.order_number} in the description</li>
                            <li>· We'll process your order once payment is confirmed</li>
                            <li>· You'll receive an email confirmation within 24 hours</li>
                        </ul>
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
                <Button className="w-full mt-6 rounded-full" size="lg" onClick={onContinueShopping}>
                    Continue shopping
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </FadeInComponent>
        </div>
    );
};

export default PendingPayment;