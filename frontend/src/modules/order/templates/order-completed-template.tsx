import CartTotals from "@modules/common/components/cart-totals";
import Help from "@modules/order/components/help";
import Items from "@modules/order/components/items";
import OrderDetails from "@modules/order/components/order-details";
import ShippingDetails from "@modules/order/components/shipping-details";
import PaymentDetails from "@modules/order/components/payment-details";
import { Order } from "types/global";
import { notFound } from "next/navigation";

type OrderCompletedTemplateProps = {
    order: Order;
};

export default function OrderCompletedTemplate({ order }: OrderCompletedTemplateProps) {

    if (!order) {
        return notFound();
    }

    return (
        <div className="py-6 min-h-[calc(100vh-64px)]">
            <div className="flex flex-col justify-center items-center gap-y-10 h-full w-full">
                <div
                    className="flex flex-col gap-4 max-w-4xl mx-auto h-full bg-default-50 w-full py-10 px-4 rounded-md"
                    data-testid="order-complete-container"
                >
                    <h1 className="flex flex-col gap-y-3 text-default-800 text-3xl mb-4">
                        <span>Thank you!</span>
                        <span>Your order was placed successfully.</span>
                    </h1>
                    <OrderDetails order={order} />
                    <h2 className="flex flex-row text-2xl">Summary</h2>
                    <Items items={order?.line_items} />
                    <CartTotals data={order} />
                    <ShippingDetails order={order} />
                    <PaymentDetails order={order} />
                    <Help />
                </div>
            </div>
        </div>
    );
}
