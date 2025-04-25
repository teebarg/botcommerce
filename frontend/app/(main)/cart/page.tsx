import { Metadata } from "next";

import ClientOnly from "@/components/generic/client-only";
import CartView from "@/components/store/cart/cart-view";

export const metadata: Metadata = {
    title: "Cart",
};

export default async function Cart() {
    return (
        <ClientOnly>
            <CartView />
        </ClientOnly>
    );
}
