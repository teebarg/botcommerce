"use client"

import { Order } from "@/lib/models";
import { currency } from "@/lib/util/util";

const OrderDetailsList: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Order Number</span>
                    <span className="font-medium">{order?.order_number}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="font-medium">{order.created_at}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-medium">{currency(50000)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Items</span>
                    <span className="font-medium">{10}</span>
                </div>
                {/* <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Estimated Delivery</span>
                    <span className="font-medium">{orderDetails.deliveryEstimate}</span>
                </div> */}
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Confirmation Email</span>
                    <span className="font-medium">{order.email}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsList
