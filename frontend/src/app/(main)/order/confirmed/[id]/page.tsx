import { Metadata } from "next";
import { retrieveOrder } from "@lib/data";
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template";
import { notFound } from "next/navigation";

type Props = {
    params: { id: string };
};

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

export default async function OrderConfirmedPage({ params }: Props) {
    const order = await getOrder(params.id);

    return <OrderCompletedTemplate order={order} />;
}
