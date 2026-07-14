import { MapPin, Truck } from "lucide-react";
import type { DeliveryOption, Order } from "@/schemas";
import { useDeliveryOptions } from "@/hooks/useApi";
import PickupCard from "../checkout/components/pickup-card";

export default function OrderAddress({ order }: { order: Order }) {
    const { data: deliveryOptions } = useDeliveryOptions();

    if (order.shipping_method === "PICKUP") {
        return (
            <PickupCard />
        );
    }

    const option = deliveryOptions?.find((item: DeliveryOption) => item.method === order.shipping_method);

    return (
        <div className="rounded-xl border bg-card p-4 mb-4 space-y-3">
            <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm">
                    <p className="font-medium">Shipping address</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {order.shipping_address?.address_1} {order.shipping_address?.address_2}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.shipping_address?.state}</p>
                </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-border">
                <Truck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm">
                    <p className="font-medium">Delivery</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimated delivery: {option?.duration}</p>
                </div>
            </div>
        </div>
    );
}