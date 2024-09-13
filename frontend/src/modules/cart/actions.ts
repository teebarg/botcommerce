"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { addItem, createCart, getCart, getProductsById, removeItem, updateCart, updateItem } from "@lib/data";
import { omit } from "@lib/util/util";

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 * const cart = await getOrSetCart()
 */
export async function getOrSetCart() {
    const cartId = cookies().get("_cart_id")?.value;
    let cart: any;

    if (cartId) {
        cart = await getCart(cartId).then((cart: any) => cart);
    }


    if (!cart) {
        cart = await createCart().then((res) => res);
        cart &&
            cookies().set("_cart_id", cart.id, {
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });
        revalidateTag("cart");
    }

    return cart;
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

export async function addToCart({ quantity }: { quantity: number }) {
    const cart = await getOrSetCart().then((cart) => cart);

    if (!cart) {
        return "Missing cart ID";
    }

    try {
        await addItem({ cartId: cart.id, quantity });
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

    if (!cartId) {
        return "Missing cart ID";
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

export async function enrichLineItems(
    lineItems: any[],
    regionId: string
): Promise<any[] | undefined> {
    // Prepare query parameters
    const queryParams = {
        ids: lineItems.map((lineItem) => lineItem.variant.product_id),
        regionId: regionId,
    };

    // Fetch products by their IDs
    const products = await getProductsById(queryParams);

    // If there are no line items or products, return an empty array
    if (!lineItems?.length || !products) {
        return [];
    }

    // Enrich line items with product and variant information

    const enrichedItems = lineItems.map((item) => {
        const product = products.find((p: any) => p.id === item.variant.product_id);
        const variant = product?.variants.find((v: any) => v.id === item.variant_id);

        // If product or variant is not found, return the original item
        if (!product || !variant) {
            return item;
        }

        // If product and variant are found, enrich the item
        return {
            ...item,
            variant: {
                ...variant,
                product: omit(product, "variants"),
            },
        };
    }) as any[];

    return enrichedItems;
}
