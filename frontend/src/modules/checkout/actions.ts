"use server";

import { cookies } from "next/headers";
import { addShippingMethod, completeCart, deleteDiscount, setPaymentSession, updateCart } from "@lib/data";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { DeliveryOption, PaymentSession } from "types/global";

export async function cartUpdate(data: any) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) return "No cartId cookie found";

    try {
        await updateCart(cartId, data);
        revalidateTag("cart");
    } catch (error: any) {
        return error.toString();
    }
}

export async function applyDiscount(code: string) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) return "No cartId cookie found";

    try {
        await updateCart(cartId, { discounts: [{ code }] }).then(() => {
            revalidateTag("cart");
        });
    } catch (error: any) {
        throw error;
    }
}

export async function applyGiftCard(code: string) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) return "No cartId cookie found";

    try {
        await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
            revalidateTag("cart");
        });
    } catch (error: any) {
        throw error;
    }
}

export async function removeDiscount(code: string) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) return "No cartId cookie found";

    try {
        await deleteDiscount(cartId, code);
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function removeGiftCard(codeToRemove: string, giftCards: any[]) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) return "No cartId cookie found";

    try {
        await updateCart(cartId, {
            gift_cards: [...giftCards].filter((gc) => gc.code !== codeToRemove).map((gc) => ({ code: gc.code })),
        }).then(() => {
            revalidateTag("cart");
        });
    } catch (error: any) {
        throw error;
    }
}

export async function submitDiscountForm(currentState: unknown, formData: FormData) {
    const code = formData.get("code") as string;

    try {
        await applyDiscount(code).catch(async (err) => {
            await applyGiftCard(code);
        });

        return null;
    } catch (error: any) {
        return error.toString();
    }
}

export async function setAddresses(currentState: unknown, formData: FormData) {
    if (!formData) return "No form data received";

    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) return { message: "No cartId cookie found" };

    const data: any = {
        shipping_address: {
            first_name: formData.get("shipping_address.first_name"),
            last_name: formData.get("shipping_address.last_name"),
            address_1: formData.get("shipping_address.address_1"),
            address_2: "",
            company: formData.get("shipping_address.company"),
            postal_code: formData.get("shipping_address.postal_code"),
            city: formData.get("shipping_address.city"),
            state: formData.get("shipping_address.state"),
            phone: formData.get("shipping_address.phone"),
        },
        email: formData.get("email"),
    };

    const sameAsBilling = formData.get("same_as_billing");

    if (sameAsBilling === "on") data.billing_address = data.shipping_address;

    if (sameAsBilling !== "on")
        data.billing_address = {
            first_name: formData.get("billing_address.first_name"),
            last_name: formData.get("billing_address.last_name"),
            address_1: formData.get("billing_address.address_1"),
            address_2: "",
            company: formData.get("billing_address.company"),
            postal_code: formData.get("billing_address.postal_code"),
            city: formData.get("billing_address.city"),
            state: formData.get("billing_address.state"),
            phone: formData.get("billing_address.phone"),
        };

    try {
        await updateCart(cartId, data);
        revalidateTag("cart");
    } catch (error: any) {
        return error.toString();
    }

    redirect(`/checkout?step=delivery`);
}

export async function setShippingMethod(option: DeliveryOption) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) throw new Error("No cartId cookie found");

    try {
        await updateCart(cartId, { shipping_method: option });
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function setPaymentMethod(method: PaymentSession) {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) throw new Error("No cartId cookie found");

    try {
        await updateCart(cartId, { payment_session: method });
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function placeOrder() {
    const cartId = cookies().get("_cart_id")?.value;

    if (!cartId) throw new Error("No cartId cookie found");

    let cart;

    try {
        cart = await completeCart(cartId);
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }

    if (cart?.type === "order") {
        cookies().set("_cart_id", "", { maxAge: -1 });
        redirect(`/order/confirmed/${cart?.data.id}`);
    }

    return cart;
}
