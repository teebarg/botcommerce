import { useState } from "react";
import { ChevronDown, ChevronUp } from "nui-react-icons";

import OrderItemComponent from "./order-item";

import { OrderItem } from "@/schemas";

const OrderItems: React.FC<{ items: OrderItem[]; showDetails: boolean }> = ({ items, showDetails }) => {
    const [expanded, setExpanded] = useState<boolean>(showDetails);

    return (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <h3 className="text-lg font-medium text-default-900">Order Items ({items.length})</h3>
                <button className="text-default-500 hover:text-default-700">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>

            {expanded && (
                <div className="divide-y divide-default-200">
                    {items.map((item: OrderItem, idx: number) => (
                        <OrderItemComponent key={idx} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderItems;
