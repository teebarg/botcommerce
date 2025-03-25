import { Metadata } from "next";
import { notFound } from "next/navigation";

import { api } from "@/apis";
import { siteConfig } from "@/lib/config";
import ServerError from "@/components/server-error";
import OrderConfirmation from "@/components/store/orders/order-confirmation";

export const metadata: Metadata = {
    title: `Order Confirmation | ${siteConfig.name}`,
    description: "View your order confirmation details",
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

    if (error || !order) {
        notFound();
    }

    return <OrderConfirmation order={order} status={order.payment_status} />;
}
