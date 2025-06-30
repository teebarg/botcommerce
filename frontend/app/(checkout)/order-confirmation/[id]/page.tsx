import { Metadata } from "next";
import { notFound } from "next/navigation";

import { api } from "@/apis";
import ServerError from "@/components/generic/server-error";
import OrderConfirmation from "@/components/store/orders/order-confirmation";

export const metadata: Metadata = {
    title: "Order Confirmation",
};

type Params = Promise<{ id: string }>;

interface OrderConfirmationPageProps {
    params: Params;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const { id } = await params;
    const { data: order, error } = await api.order.get(id);

    if (error) {
        return <ServerError />;
    }

    if (!order) {
        return notFound();
    }

    return <OrderConfirmation order={order} status={order.payment_status} />;
}
