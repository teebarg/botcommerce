"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { addItem, createCart, getCart, getProductsById, removeItem, updateCart, updateItem } from "@lib/data";
import { generateId, omit } from "@lib/util/util";

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 * const cart = await getOrSetCart()
 */
export async function getOrSetCart() {
    const cartId = cookies().get("_cart_id")?.value;
    // let cart: any;
    console.log("line 18");
    console.log(cartId);

    // if (cartId) {
    //     cart = await getCart(cartId).then((cart: any) => cart);
    //     console.log("line 23");
    //     console.log(cart);
    // }

    if (!cartId) {
        // cart = await createCart().then((res) => res);
        const cartId = generateId();
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

export async function addToCart({ product_id, quantity }: { product_id: string, quantity: number }) {
    // const cart = await getOrSetCart().then((cart) => cart);
    const cartId = await getOrSetCart();
    console.log("hmm,mmmmmmm");
    console.log(cartId);

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

    if (!cartId) {
        return "Missing cart ID";
    }

    try {
        await removeItem({ cartId, lineId });
        revalidateTag("cart");
    } catch (e) {
        return "Error deleting line item";
    }
}

export async function enrichLineItems(lineItems: any[]): Promise<any[] | undefined> {
    // Prepare query parameters
    // const queryParams = {
    //     ids: lineItems.map((lineItem) => lineItem.variant.product_id),
    // };

    // Fetch products by their IDs
    // const products = await getProductsById(queryParams);

    // If there are no line items or products, return an empty array
    if (!lineItems?.length) {
        return [];
    }

    // Enrich line items with product and variant information

    const enrichedItems = lineItems.map((item) => {
        // If product and variant are found, enrich the item
        return {
            ...item,
        };
    }) as any[];

    return enrichedItems;
}
