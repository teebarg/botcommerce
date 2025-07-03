"use client";

import OrderCard from "@/components/store/orders/order-card";

import { Order } from "@/schemas";
import { BtnLink } from "@/components/ui/btnLink";

const OrderOverview = ({ orders }: { orders: Order[] }) => {
    if (orders?.length) {
        return <div className="flex flex-col gap-y-8 w-full">{orders?.map((o: Order, idx: number) => <OrderCard key={idx} order={o} />)}</div>;
    }

    return (
        <div className="w-full flex flex-col items-center" data-testid="no-orders-container">
            <h2 className="text-lg">Nothing to see here</h2>
            <p>You don&apos;t have any orders yet, let us change that {":)"}</p>
            <div className="mt-8">
                <BtnLink data-testid="continue-shopping-button" href="/collections">
                    Continue shopping
                </BtnLink>
            </div>
        </div>
    );
};

export default OrderOverview;
