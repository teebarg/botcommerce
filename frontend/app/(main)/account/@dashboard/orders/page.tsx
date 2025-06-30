"use client";

import OrderOverview from "@modules/account/components/order-overview";

import ServerError from "@/components/generic/server-error";
import { useOrders } from "@/lib/hooks/useOrder";
import { Skeleton } from "@/components/ui/skeletons";

export default function Orders() {
    const { data, error, isLoading } = useOrders({ take: 20 });

    if (error) {
        return <ServerError />;
    }

    if (isLoading) {
        return <Skeleton className="h-192" />;
    }

    return (
        <div className="w-full" data-testid="orders-page-wrapper">
            <div className="mb-8">
                <h1 className="text-2xl">Orders</h1>
                <p>View your previous orders and their status. You can also create returns or exchanges for your orders if needed.</p>
            </div>
            <div>
                <OrderOverview orders={data?.orders || []} />
            </div>
        </div>
    );
}
