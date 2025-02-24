"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { addItem, removeItem, updateItem } from "@lib/data";
import { generateId } from "@lib/util/util";

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 */
export async function getOrSetCart() {
    const cookieStore = await cookies();
    let cartId = cookieStore.get("_cart_id")?.value;

    if (!cartId) {
        cartId = generateId();
        cookieStore.set("_cart_id", cartId, {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        revalidateTag("cart");
    }

    return cartId;
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
    const cookieStore = await cookies();
    const cartId = cookieStore.get("_cart_id")?.value;

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
    const cookieStore = await cookies();
    const cartId = cookieStore.get("_cart_id")?.value;

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
