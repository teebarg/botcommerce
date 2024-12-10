import { Order } from "types/global";

type OrderDetailsProps = {
    order: Order;
    showStatus?: boolean;
};

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
    const formatStatus = (str: string) => {
        const formatted = str?.split("_")?.join(" ");

        return formatted?.slice(0, 1)?.toUpperCase() + formatted?.slice(1);
    };

    return (
        <div>
            <p>
                We have sent the order confirmation details to{" "}
                <span className="text-default-900 font-semibold" data-testid="order-email">
                    {order.email}
                </span>
                .
            </p>
            <p className="mt-2">
                Order date: <span data-testid="order-date">{new Date(order.created_at).toDateString()}</span>
            </p>
            <p className="mt-2 text-primary-500 font-semibold">
                Order number: <span data-testid="order-id">{order.order_id}</span>
            </p>

            <div className="flex items-center text-sm gap-x-4 mt-4">
                {showStatus && (
                    <>
                        <p>
                            Order status: <span data-testid="order-status">{formatStatus(order.fulfillment_status)}</span>
                        </p>
                        <p>
                            Payment status: <span data-testid="order-payment-status">{formatStatus(order.payment_status)}</span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
