
import { Metadata } from "next";
import { cookies } from "next/headers";
import CartTemplate from "@modules/cart/templates";
import { enrichLineItems } from "@modules/cart/actions";
// import { getCheckoutStep } from "@lib/util/get-checkout-step";
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

    if (cart?.items.length) {
        const enrichedItems = await enrichLineItems(cart?.items);

        cart.items = enrichedItems as any[];
    }

    // cart.checkout_step = cart && getCheckoutStep(cart);

    return cart;
};

export default async function Cart() {
    const cart = await fetchCart();
    const customer = await getCustomer();

    return <CartTemplate cart={cart} customer={customer} />;
}
