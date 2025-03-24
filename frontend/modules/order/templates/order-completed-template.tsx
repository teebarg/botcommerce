import Help from "@modules/order/components/help";
import OrderDetails from "@modules/order/components/order-details";
import ShippingDetails from "@modules/order/components/shipping-details";
import PaymentDetails from "@modules/order/components/payment-details";

import { Order } from "@/lib/models";
import OrderItems from "@/components/order/order-details";
import OrderTotals from "@/components/store/orders/order-totals";

type OrderCompletedTemplateProps = {
    order: Order;
};

export default function OrderCompletedTemplate({ order }: OrderCompletedTemplateProps) {
    return (
        <div className="sm:py-6 min-h-[calc(100vh-64px)]">
            <div className="flex flex-col justify-center items-center gap-y-10 h-full w-full">
                <div
                    className="flex flex-col gap-4 max-w-4xl mx-auto h-full bg-default-100 w-full py-4 sm:py-10 px-4 rounded-md"
                    data-testid="order-complete-container"
                >
                    <h1 className="flex flex-col gap-y-3 text-default-900 text-3xl mb-4">
                        <span>Thank you!</span>
                        <span>Your order was placed successfully.</span>
                    </h1>
                    <OrderDetails order={order} />
                    <h2 className="flex flex-row text-2xl">Summary</h2>
                    <OrderItems items={order?.order_items} />
                    <OrderTotals data={order} />
                    <ShippingDetails order={order} />
                    <PaymentDetails order={order} />
                    <Help />
                </div>
            </div>
        </div>
    );
}
