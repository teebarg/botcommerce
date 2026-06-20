import { Download } from "lucide-react";
import OrderOverview from "./order-overview";
import { Button } from "@/components/ui/button";
import type { Order } from "@/schemas";
import OrderSummary from "./order-summary";
import OrderItems from "./order-items";
import OrderAddress from "./order-address";

interface OrderDetailsProps {
    order: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid gap-6 lg:grid-cols-3 overflow-y-auto px-2 py-4">
                <div className="lg:col-span-2 space-y-6">
                    <OrderOverview order={order} />
                    <OrderItems items={order.order_items} />
                </div>
                <div className="space-y-6">
                    <OrderSummary order={order} />
                    <OrderAddress order={order} />
                    <div className="space-y-3">
                        <Button className="w-full" variant="outline">
                            Contact Support
                        </Button>
                        {order.invoice_url && (
                            <a
                                download
                                className="flex items-center justify-center text-sm font-medium transition-colors bg-transparent border border-primary text-primary py-2 px-4 rounded-lg w-full"
                                href={order.invoice_url}
                            >
                                <Download className="w-4 h-4 mr-2 group-hover/link:-translate-y-px transition-transform" />
                                Download Invoice
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
