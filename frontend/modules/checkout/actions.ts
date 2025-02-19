"use server";

import { cookies } from "next/headers";
import { completeCart, updateCart } from "@lib/data";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { DeliveryOption, Order, PaymentSession } from "types/global";

async function cartId() {
    const cookieStore = await cookies();
    return cookieStore.get("_cart_id")?.value;
}

export async function cartUpdate(data: any) {
    const id = await cartId();

    if (!id) return "No cartId cookie found";

    try {
        await updateCart(id, data);
        revalidateTag("cart");
    } catch (error: any) {
        return error.toString();
    }
}

export async function applyDiscount(code: string) {
    const id = await cartId();

    if (!id) return "No cartId cookie found";

    try {
        await updateCart(id, { discounts: [{ code }] }).then(() => {
            revalidateTag("cart");
        });
    } catch (error: any) {
        throw error;
    }
}

export async function applyGiftCard(code: string) {
    const id = await cartId();

    if (!id) return "No cartId cookie found";

    try {
        await updateCart(id, { gift_cards: [{ code }] }).then(() => {
            revalidateTag("cart");
        });
    } catch (error: any) {
        throw error;
    }
}

export async function removeDiscount(code: string) {
    const id = await cartId();

    if (!id) return "No cartId cookie found";

    try {
        // await deleteDiscount(cartId, code);
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function removeGiftCard(codeToRemove: string, giftCards: any[]) {
    const id = await cartId();

    if (!id) return "No cartId cookie found";

    try {
        await updateCart(id, {
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

    const id = await cartId();

    if (!id) return { message: "No cartId cookie found" };

    const data: any = {
        shipping_address: {
            firstname: formData.get("shipping_address.firstname"),
            lastname: formData.get("shipping_address.lastname"),
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
            firstname: formData.get("billing_address.firstname"),
            lastname: formData.get("billing_address.lastname"),
            address_1: formData.get("billing_address.address_1"),
            address_2: "",
            company: formData.get("billing_address.company"),
            postal_code: formData.get("billing_address.postal_code"),
            city: formData.get("billing_address.city"),
            state: formData.get("billing_address.state"),
            phone: formData.get("billing_address.phone"),
        };

    try {
        await cartUpdate(data);
        revalidateTag("cart");
    } catch (error: any) {
        return error.toString();
    }

    redirect(`/checkout?step=delivery`);
}

export async function setShippingMethod(option: DeliveryOption) {
    const id = await cartId();

    if (!id) throw new Error("No cartId cookie found");

    try {
        await updateCart(id, { shipping_method: option });
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function setPaymentMethod(method: PaymentSession) {
    const id = await cartId();

    if (!id) throw new Error("No cartId cookie found");

    try {
        await updateCart(id, { payment_session: method });
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function placeOrder() {
    const id = await cartId();

    if (!id) throw new Error("No cartId cookie found");

    let order: Order;

    try {
        order = await completeCart(id);
        revalidateTag("cart");
        const cookieStore = await cookies();
        cookieStore.set("_cart_id", "", { maxAge: -1 });
        redirect(`/order/confirmed/${order.order_id}`);
    } catch (error: any) {
        throw error;
    }

    return order;
}
