"use server";

import { addWishlist, removeWishlist } from "@lib/data";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
        console.log("🚀 ~ addWish ~ error:", error)
        return { success: false, error: error.toString() };
    }
}
