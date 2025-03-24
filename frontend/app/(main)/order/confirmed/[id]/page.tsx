import { Metadata } from "next";
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template";
import { notFound } from "next/navigation";

import { api } from "@/apis";
import ServerError from "@/components/server-error";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
    title: "Order Confirmed",
    description: "You purchase was successful",
};

export default async function OrderConfirmedPage({ params }: { params: Params }) {
    const { id } = await params;
    const { data: order, error } = await api.order.get(id);

    if (error) {
        return <ServerError />;
    }

    if (!order) {
        return notFound();
    }

    return <OrderCompletedTemplate order={order} />;
}
