import { Metadata } from "next";
import { retrieveOrder } from "@lib/data";
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

async function getOrder(id: string) {
    const order = await retrieveOrder(id);

    if (!order) {
        return notFound();
    }

    return order;
}

export const metadata: Metadata = {
    title: "Order Confirmed",
    description: "You purchase was successful",
};

export default async function OrderConfirmedPage({ params }: { params: Params }) {
    const { id } = await params;
    const order = await getOrder(id);

    return <OrderCompletedTemplate order={order} />;
}
