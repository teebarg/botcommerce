import { Metadata } from "next";

import OrderConfirmation from "@/components/store/orders/order-confirmation";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
    title: "Order Details",
};

export default async function OrderDetailPage({ params }: { params: Params }) {
    const { id } = await params;

    return <OrderConfirmation orderNumber={id} />;
}
