"use server";

import { revalidateTag } from "next/cache";

export async function removeDiscount(code: string) {
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
