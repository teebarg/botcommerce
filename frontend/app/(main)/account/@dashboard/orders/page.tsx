"use client";

import ServerError from "@/components/generic/server-error";
import { useOrders } from "@/lib/hooks/useOrder";
import ComponentLoader from "@/components/component-loader";
import OrderOverview from "@/components/store/orders/order-overview";

export default function Orders() {
    const { data, error, isLoading } = useOrders({ take: 20 });

    if (error) {
        return <ServerError />;
    }

    return (
        <div className="w-full" data-testid="orders-page-wrapper">
            <div className="mb-8">
                <h1 className="text-2xl">Orders</h1>
                <p className="text-sm text-default-700">
                    View your previous orders and their status. You can also create returns or exchanges for your orders if needed.
                </p>
            </div>
            <div>{isLoading ? <ComponentLoader className="h-192" /> : <OrderOverview orders={data?.orders || []} />}</div>
        </div>
    );
}
