import { Metadata } from "next";
import React from "react";

import OrderList from "@/components/order/order-list";
import { api } from "@/apis";
import ServerError from "@/components/server-error";

export const metadata: Metadata = {
    title: "Children clothing",
};

type SearchParams = Promise<{
    search?: string;
    skip?: string;
    take?: string;
}>;

type ProductPageProps = {
    searchParams: SearchParams;
};

export default async function OrdersPage({ searchParams }: ProductPageProps) {
    const { search = "", skip: skipStr = "0", take: takeStr = "20" } = await searchParams;
    const skip = parseInt(skipStr, 10);
    const take = parseInt(takeStr, 10);

    const [ordersResponse] = await Promise.all([api.order.query({ search, skip, take })]);

    // Early returns for error handling
    if (ordersResponse.error) {
        return <ServerError />;
    }

    if (!ordersResponse.data) {
        return <div>No data found</div>;
    }

    const { orders, ...pagination } = ordersResponse.data;

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Orders</h1>
            </div>
            <OrderList orders={orders} pagination={pagination} />
        </div>
    );
}
