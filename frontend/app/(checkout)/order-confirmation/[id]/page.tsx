import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/apis";
// import OrderConfirmation from "@/modules/orders/components/order-confirmation";
import { siteConfig } from "@/lib/config";
import ServerError from "@/components/server-error";
import OrderConfirmation from "@/modules/orders/components/order-confirmation2";

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

    // return <OrderConfirmation order={order} />;
    return <OrderConfirmation status={order.payment_status} order={order} />;
} 