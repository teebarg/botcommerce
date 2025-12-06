import { useState } from "react";

import OrderItemComponent from "./order-item";

import { OrderItem } from "@/schemas";
import { ChevronDown, ChevronUp } from "lucide-react";

const OrderItems: React.FC<{ items: OrderItem[]; showDetails: boolean }> = ({ items, showDetails }) => {
    const [expanded, setExpanded] = useState<boolean>(showDetails);

    return (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <h3 className="text-lg font-medium">Order Items ({items.length})</h3>
                <button className="text-muted-foreground">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>

            {expanded && (
                <div className="divide-y divide-border">
                    {items.map((item: OrderItem, idx: number) => (
                        <OrderItemComponent key={idx} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderItems;
