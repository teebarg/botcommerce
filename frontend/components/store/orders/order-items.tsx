import { useState } from "react";
import { ChevronDown, ChevronUp } from "nui-react-icons";

import { OrderItem } from "@/lib/models";
import { currency } from "@/lib/util/util";

// Order Items Component
const OrderItems: React.FC<{ items: OrderItem[]; showDetails: boolean }> = ({ items, showDetails }) => {
    const [expanded, setExpanded] = useState<boolean>(showDetails);

    return (
        <div className="bg-content1 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <h3 className="text-lg font-medium text-default-900">Order Items ({items.length})</h3>
                <button className="text-default-500 hover:text-default-700">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>

            {expanded && (
                <div className="divide-y divide-gray-100">
                    {items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="p-4 flex items-start">
                            <div className="rounded-lg overflow-hidden w-20 h-20 flex-shrink-0">
                                <img alt={item.variant.name} className="w-full h-full object-cover" src={item.image} />
                            </div>

                            <div className="ml-4 flex-grow">
                                <div className="flex justify-between">
                                    <h4 className="font-medium text-default-900">{item.variant.name}</h4>
                                    <span className="font-medium text-default-900">{currency(item.price)}</span>
                                </div>

                                <div className="mt-1 text-sm text-default-500">
                                    {/* <div className="flex space-x-4">
                                        {item.color && <span>Color: {item.color}</span>}
                                        {item.size && <span>Size: {item.size}</span>}
                                    </div> */}
                                    <div className="mt-1">Qty: {item.quantity}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderItems;
