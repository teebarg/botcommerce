"use client";

import ServerError from "@/components/generic/server-error";
import { useOrders } from "@/lib/hooks/useOrder";
import ComponentLoader from "@/components/component-loader";
import { Order } from "@/schemas";
import OrderCard from "@/components/store/orders/order-card";
import { BtnLink } from "@/components/ui/btnLink";

export default function Orders() {
    const { data, error, isLoading } = useOrders({ take: 20 });

    if (error) {
        return <ServerError />;
    }

    return (
        <div className="w-full px-2" data-testid="orders-page-wrapper">
            <div className="mb-8">
                <h1 className="text-2xl">Orders</h1>
                <p className="text-sm text-default-700">
                    View your previous orders and their status. You can also create returns or exchanges for your orders if needed.
                </p>
            </div>
            <div>
                {isLoading ? (
                    <ComponentLoader className="h-192" />
                ) : data?.orders?.length ? (
                    <div className="flex flex-col gap-y-8 w-full">{data.orders?.map((o: Order, idx: number) => <OrderCard key={idx} order={o} />)}</div>
                ) : (
                    <div className="w-full flex flex-col items-center" data-testid="no-orders-container">
                        <h2 className="text-lg">Nothing to see here</h2>
                        <p>You don&apos;t have any orders yet, let us change that {":)"}</p>
                        <div className="mt-8">
                            <BtnLink data-testid="continue-shopping-button" href="/collections">
                                Continue shopping
                            </BtnLink>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
