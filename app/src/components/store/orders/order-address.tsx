import { MapPin, Truck } from "lucide-react";

import type { DeliveryOption, Order } from "@/schemas";
import { useConfig } from "@/providers/store-provider";
import { useDeliveryOptions } from "@/hooks/useApi";

const OrderAddress: React.FC<{ order: Order }> = ({ order }) => {
    const { config } = useConfig();
    const { data: deliveryOptions } = useDeliveryOptions();

    if (order.shipping_method === "PICKUP") {
        return (
            <div className="bg-secondary rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-start mb-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="ml-3">
                        <p className="font-medium">Collection Point</p>
                        <p className="text-sm text-muted-foreground">{config?.address}</p>
                        <p className="text-sm text-muted-foreground">Open Mon-Sat: 9am - 6pm</p>
                    </div>
                </div>
            </div>
        );
    }

    const option = deliveryOptions?.find((item: DeliveryOption) => item.method == order.shipping_method);

    return (
        <div className="bg-secondary rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="ml-3">
                    <h3 className="font-medium">Shipping Address</h3>
                    <div className="mt-1 text-sm text-muted-foreground">
                        <p>
                            {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                        </p>
                        <p>{order.shipping_address?.address_1}</p>
                        <p>{order.shipping_address?.state}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-start">
                <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="ml-3">
                    <h3 className="font-medium">Delivery</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Estimated delivery: {option?.duration}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderAddress;
