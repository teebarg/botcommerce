import { Metadata } from "next";
import { cookies } from "next/headers";
import CartTemplate from "@modules/cart/templates";
import { getCart, getCustomer } from "@lib/data";
import { Cart as CartType } from "types/global";

export const metadata: Metadata = {
    title: "Cart",
    description: "View your cart",
};

const fetchCart = async () => {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return null;
    }

    const cart = await getCart(cartId).then((cart: CartType) => cart);

    if (!cart) {
        return null;
    }

    // cart.checkout_step = cart && getCheckoutStep(cart);

    return cart;
};

export default async function Cart() {
    const cart = (await fetchCart()) as CartType;
    const customer = await getCustomer();

    return <CartTemplate cart={cart} customer={customer} />;
}
