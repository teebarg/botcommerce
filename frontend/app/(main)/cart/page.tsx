import { Metadata } from "next";

import CartView from "@/components/store/cart/cart-view";

export const metadata: Metadata = {
    title: "Cart",
};

export default async function Cart() {
    return <CartView />;
}
