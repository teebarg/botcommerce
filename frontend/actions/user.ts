"use server";

import { revalidateTag } from "next/cache";

import { api } from "@/api";

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
