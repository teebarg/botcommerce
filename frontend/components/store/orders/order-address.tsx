import { MapPin } from "lucide-react";
import { Truck } from "nui-react-icons";

import { Order } from "@/schemas";

// Address & Payment Summary Component
const OrderAddress: React.FC<{ order: Order }> = ({ order }) => {
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
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-start">
                <Truck className="w-5 h-5 text-default-500 mt-0.5" />
                <div className="ml-3">
                    <h3 className="font-medium text-default-900">Delivery</h3>
                    <p className="mt-1 text-sm text-default-600">Estimated delivery: 3days</p>
                </div>
            </div>
        </div>
    );
};

export default OrderAddress;
