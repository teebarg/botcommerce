import { MapPin, Truck } from "lucide-react";

import { DeliveryOption, Order } from "@/schemas";
import { useStoreSettings } from "@/providers/store-provider";
import { useDeliveryOptions } from "@/lib/hooks/useApi";

const OrderAddress: React.FC<{ order: Order }> = ({ order }) => {
    const { settings } = useStoreSettings();
    const { data: deliveryOptions } = useDeliveryOptions();

    if (order.shipping_method === "PICKUP") {
        return (
            <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-start mb-3">
                    <MapPin className="w-5 h-5 text-default-500 mt-0.5" />
                    <div className="ml-3">
                        <p className="font-medium text-default-900">Collection Point</p>
                        <p className="text-sm text-default-500">{settings?.address}</p>
                        <p className="text-sm text-default-500">Open Mon-Sat: 9am - 6pm</p>
                    </div>
                </div>
            </div>
        );
    }

    const option = deliveryOptions?.find((item: DeliveryOption) => item.method == order.shipping_method);

    return (
        <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-default-500 mt-0.5" />
                <div className="ml-3">
                    <h3 className="font-medium text-default-900">Shipping Address</h3>
                    <div className="mt-1 text-sm text-default-600">
                        <p>
                            {order.shipping_address.first_name} {order.shipping_address.last_name}
                        </p>
                        <p>{order.shipping_address.address_1}</p>
                        <p>
                            {order.shipping_address.city}, {order.shipping_address.state}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-start">
                <Truck className="w-5 h-5 text-default-500 mt-0.5" />
                <div className="ml-3">
                    <h3 className="font-medium text-default-900">Delivery</h3>
                    <p className="mt-1 text-sm text-default-600">Estimated delivery: {option?.duration}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderAddress;
