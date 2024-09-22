import { Metadata } from "next";
import { notFound } from "next/navigation";
import { retrieveOrder } from "@lib/data";
import OrderDetailsTemplate from "@modules/order/templates/order-details-template";
import { Order } from "types/global";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const order: Order = await retrieveOrder(params.id);


    if (!order) {
        notFound();
    }

    return {
        title: `Order #${order.order_id}`,
        description: `View your order`,
    };
}

export default async function OrderDetailPage({ params }: Props) {
    const order = await retrieveOrder(params.id);

    if (!order) {
        notFound();
    }

    return <OrderDetailsTemplate order={order} />;
}
