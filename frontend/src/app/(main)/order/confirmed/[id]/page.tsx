import { Metadata } from "next";
import { retrieveOrder } from "@lib/data";
import { enrichLineItems } from "@modules/cart/actions";
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

    const enrichedItems = await enrichLineItems(order.items, order.region_id);

    return {
        order: {
            ...order,
            items: enrichedItems as any[],
        } as any,
    };
}

export const metadata: Metadata = {
    title: "Order Confirmed",
    description: "You purchase was successful",
};

export default async function OrderConfirmedPage({ params }: Props) {
    const { order } = await getOrder(params.id);

    return <OrderCompletedTemplate order={order} />;
}
