"use client";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Button from "@modules/common/components/button";
import { Order } from "types/global";

import OrderCard from "../order-card";

const OrderOverview = ({ orders }: { orders: any[] }) => {
    if (orders?.length) {
        return (
            <div className="flex flex-col gap-y-8 w-full">
                {orders.map((o: Order, i: number) => (
                    <div key={`order-${i}`} className="border-b border-gray-200 pb-6 last:pb-0 last:border-none">
                        <OrderCard order={o} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center gap-y-4" data-testid="no-orders-container">
            <h2 className="text-lg">Nothing to see here</h2>
            <p className="">You don&apos;t have any orders yet, let us change that {":)"}</p>
            <div className="mt-4">
                <LocalizedClientLink passHref href="/">
                    <Button color="default" data-testid="continue-shopping-button">
                        Continue shopping
                    </Button>
                </LocalizedClientLink>
            </div>
        </div>
    );
};

export default OrderOverview;