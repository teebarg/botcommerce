import { useState } from "react";
import OrderItemComponent from "./order-item";
import type { OrderItem } from "@/schemas";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function OrderItems({ items, showDetails = true }: { items: OrderItem[]; showDetails?: boolean }) {
    const [expanded, setExpanded] = useState(showDetails);

    return (
        <div className="rounded-xl border bg-card overflow-hidden mb-4">
            <button
                className="w-full flex justify-between items-center px-4 py-3"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="text-sm font-medium">Order items ({items.length})</span>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expanded && (
                <div className="divide-y divide-border border-t">
                    {items.map((item, idx) => (
                        <OrderItemComponent key={idx} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}