"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

import { api } from "@/apis";

async function cartId() {
    const cookieStore = await cookies();

    return cookieStore.get("_cart_id")?.value;
}

export async function cartUpdate(data: any) {
    try {
        await api.cart.updateDetails(data);
    } catch (error: any) {
        return error.toString();
    }
}

export async function removeDiscount(code: string) {
    const id = await cartId();

    if (!id) return "No cartId cookie found";

    try {
        // TODO: implement removeDiscount
        revalidateTag("cart");
    } catch (error: any) {
        throw error;
    }
}

export async function removeGiftCard(codeToRemove: string, giftCards: any[]) {
    try {
        // TODO: implement removeGiftCard
    } catch (error: any) {
        throw error;
    }
}

export async function submitDiscountForm(currentState: unknown, formData: FormData) {
    const code = formData.get("code") as string;

    try {
        // TODO: implement applyDiscount and applyGiftCard

        return null;
    } catch (error: any) {
        return error.toString();
    }
}
