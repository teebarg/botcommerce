import { useState } from "react";
import { ChevronDown, ChevronUp } from "nui-react-icons";

import { OrderItem } from "@/types/models";
import { currency } from "@/lib/utils";

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
                <div className="divide-y divide-default-200">
                    {items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="p-4 flex items-start">
                            <div className="rounded-lg overflow-hidden w-20 h-20 shrink-0">
                                <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                            </div>

                            <div className="ml-4 grow">
                                <div className="flex justify-between gap-4">
                                    <h4 className="font-medium text-default-900 text-sm">{item.name}</h4>
                                    <span className="font-semibold text-default-900">{currency(item.price)}</span>
                                </div>

                                <div className="mt-1 text-sm text-default-500">
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
