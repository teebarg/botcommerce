"use server";

import { api } from "@/api";
import { revalidateTag } from "next/cache";

export async function removeWish(id: number) {
    try {
        await api.user.deleteWishlist(id);
        revalidateTag("wishlists");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function addWish(id: number) {
    try {
        await api.user.addWishlist(id);
        revalidateTag("beaf");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}
