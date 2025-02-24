import { notFound } from "next/navigation";
import OrderDetailsTemplate from "@modules/order/templates/order-details-template";

import { Order } from "@/lib/models";
import { api } from "@/api";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { id } = await params;
    const order: Order = await api.order.get(id);

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
    const order = await api.order.get(id);

    if (!order) {
        notFound();
    }

    return <OrderDetailsTemplate order={order} />;
}
