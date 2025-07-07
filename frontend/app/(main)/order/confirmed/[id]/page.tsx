import { Metadata } from "next";

import OrderConfirmation from "@/components/store/orders/order-confirmation";
import ClientOnly from "@/components/generic/client-only";

export const metadata: Metadata = {
    title: "Order Confirmation",
};

type Params = Promise<{ id: string }>;

interface OrderConfirmationPageProps {
    params: Params;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const { id } = await params;

    return (
        <ClientOnly>
            <OrderConfirmation orderNumber={id} />
        </ClientOnly>
    );
}
