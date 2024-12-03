"use server";

import { addWishlist, removeWishlist } from "@lib/data";
import { revalidateTag } from "next/cache";

export async function removeWish(id: number) {
    try {
        await removeWishlist(id);
        revalidateTag("wishlists");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function addWish(id: number) {
    try {
        await addWishlist(id);
        revalidateTag("wishlists");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}
