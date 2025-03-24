"use server";

import { cookies } from "next/headers";

export async function setCartSession(token?: string) {
    if (!token) {
        return;
    }
    const cookieStore = await cookies();

    cookieStore.set("_cart_id", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        // sameSite: "strict",
    });
}

export async function getCartSession() {
    const cookieStore = await cookies();

    return cookieStore.get("_cart_id")?.value || null;
}

export async function clearCartSession() {
    const cookieStore = await cookies();

    cookieStore.delete("_cart_id");
}
