"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { addItem, getCart, removeItem, updateItem } from "@lib/data";
import { generateId } from "@lib/util/util";

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 */
export async function getOrSetCart() {
    let cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        cartId = generateId();
        cookies().set("_cart_id", cartId, {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        revalidateTag("cart");
    }

    return cartId;
}

export async function retrieveCart() {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return null;
    }

    try {
        const cart = await getCart(cartId).then((cart: any) => cart);

        return cart;
    } catch (e) {
        console.log(e);

        return null;
    }
}

export async function addToCart({ product_id, quantity }: { product_id: string; quantity: number }) {
    const cartId = await getOrSetCart();

    if (!cartId) {
        return "Missing cart ID";
    }

    try {
        await addItem({ cartId, product_id, quantity });
        revalidateTag("cart");
    } catch (e) {
        return "Error adding item to cart";
    }
}

export async function updateLineItem({ lineId, quantity }: { lineId: string; quantity: number }) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return "Missing cart ID";
    }

    if (!lineId) {
        return "Missing lineItem ID";
    }

    try {
        await updateItem({ cartId, lineId, quantity });
        revalidateTag("cart");
    } catch (e: any) {
        return e.toString();
    }
}

export async function deleteLineItem(lineId: string) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) {
        return "Missing cart ID";
    }

    if (!lineId) {
        return "Missing lineItem ID";
    }

    try {
        await removeItem({ cartId, lineId });
        revalidateTag("cart");
    } catch (e) {
        return "Error deleting line item";
    }
}
