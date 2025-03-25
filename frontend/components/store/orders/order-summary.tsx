import { MapPin } from "lucide-react";
import { Truck } from "nui-react-icons";

import { Order } from "@/lib/models";
import { currency } from "@/lib/util/util";

// Address & Payment Summary Component
const OrderSummary: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="space-y-6">
            <div className="bg-content1 rounded-xl shadow-sm p-4">
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

            <div className="bg-content1 rounded-xl shadow-sm p-4">
                <h3 className="font-medium text-default-900 mb-3">Payment Details</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-default-500">Payment Method</span>
                        <span className="text-default-900">{order.payment_method}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-default-500">Subtotal</span>
                        <span className="text-default-900">{currency(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-default-500">Shipping</span>
                        <span className="text-default-900">{currency(order.shipping_fee)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-default-500">Tax</span>
                        <span className="text-default-900">{currency(order.tax)}</span>
                    </div>

                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                            <span className="text-default-900">Total</span>
                            <span className="text-default-900">{currency(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
