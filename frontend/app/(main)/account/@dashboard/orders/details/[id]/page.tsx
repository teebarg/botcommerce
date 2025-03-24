import { notFound } from "next/navigation";
import OrderDetailsTemplate from "@modules/order/templates/order-details-template";

import { api } from "@/apis";
import ServerError from "@/components/server-error";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { id } = await params;
    const { data: order } = await api.order.get(id);

    if (!order) {
        return { title: "Order not found", description: "Order not found" };
    }

    return {
        title: `Order #${order.order_number}`,
        description: `View your order`,
    };
}

export default async function OrderDetailPage({ params }: { params: Params }) {
    const { id } = await params;
    const { data: order, error } = await api.order.get(id);

    if (error) {
        return <ServerError />;
    }

    if (!order) {
        notFound();
    }

    return <OrderDetailsTemplate order={order} />;
}
