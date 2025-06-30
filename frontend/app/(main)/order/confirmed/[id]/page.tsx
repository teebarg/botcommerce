import { Metadata } from "next";

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

    return <OrderConfirmation orderId={Number(id)} />;
}
