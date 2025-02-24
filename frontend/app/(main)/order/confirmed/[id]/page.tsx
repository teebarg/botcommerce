import { Metadata } from "next";
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template";
import { notFound } from "next/navigation";

import { api } from "@/api";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
    title: "Order Confirmed",
    description: "You purchase was successful",
};

export default async function OrderConfirmedPage({ params }: { params: Params }) {
    const { id } = await params;
    const order = await api.order.get(id);

    if (!order) {
        return notFound();
    }

    return <OrderCompletedTemplate order={order} />;
}
