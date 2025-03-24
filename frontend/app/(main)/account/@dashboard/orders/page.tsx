import { Metadata } from "next";
import OrderOverview from "@modules/account/components/order-overview";
import { notFound } from "next/navigation";

import { api } from "@/apis";
import ServerError from "@/components/server-error";

export const metadata: Metadata = {
    title: "Orders",
    description: "Overview of your previous orders.",
};

export default async function Orders() {
    const { data, error } = await api.order.query({ take: 20 });

    if (error) {
        return <ServerError />;
    }

    if (!data) {
        notFound();
    }

    return (
        <div className="w-full" data-testid="orders-page-wrapper">
            <div className="mb-8 flex flex-col gap-y-4">
                <h1 className="text-2xl">Orders</h1>
                <p>View your previous orders and their status. You can also create returns or exchanges for your orders if needed.</p>
            </div>
            <div>
                <OrderOverview orders={data.orders} />
            </div>
        </div>
    );
}
