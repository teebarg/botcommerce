"use client";

import OrderCard from "../order-card";

import { Order } from "@/types/models";
import { BtnLink } from "@/components/ui/btnLink";

const OrderOverview = ({ orders }: { orders: Order[] }) => {
    if (orders?.length) {
        return (
            <div className="flex flex-col gap-y-8 w-full">
                {orders?.map((o: Order, idx: number) => (
                    <div key={`order-${idx}`} className="border-b border-gray-200 pb-6 last:pb-0 last:border-none">
                        <OrderCard order={o} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center gap-y-4" data-testid="no-orders-container">
            <h2 className="text-lg">Nothing to see here</h2>
            <p>You don&apos;t have any orders yet, let us change that {":)"}</p>
            <div className="mt-4">
                <BtnLink data-testid="continue-shopping-button" href="/">
                    Continue shopping
                </BtnLink>
            </div>
        </div>
    );
};

export default OrderOverview;
