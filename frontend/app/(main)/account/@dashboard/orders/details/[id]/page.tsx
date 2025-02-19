import { notFound } from "next/navigation";
import { retrieveOrder } from "@lib/data";
import OrderDetailsTemplate from "@modules/order/templates/order-details-template";
import { Order } from "types/global";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { id } = await params;
    const order: Order = await retrieveOrder(id);

    if (!order) {
        notFound();
    }

    return {
        title: `Order #${order.order_id}`,
        description: `View your order`,
    };
}

export default async function OrderDetailPage({ params }: { params: Params }) {
    const { id } = await params;
    const order = await retrieveOrder(id);

    if (!order) {
        notFound();
    }

    return <OrderDetailsTemplate order={order} />;
}
