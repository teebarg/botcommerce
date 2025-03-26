import { Order } from "@/lib/models";

const OrderInfo: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-content1 rounded-xl shadow-sm p-4 mb-6">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-default-500">Order Number</span>
                    <span className="font-medium text-default-900">{order.order_number}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-default-500">Date</span>
                    <span className="text-default-900">{new Date(order.created_at).toDateString()}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-default-500">Email</span>
                    <span className="text-default-900">{order.email}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
