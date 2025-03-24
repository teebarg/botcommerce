"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function revalidate(tag: string) {
    revalidateTag(tag);
}

export async function signOut() {
    const cookieStore = await cookies();

    cookieStore.set("access_token", "", {
        maxAge: -1,
    });
    revalidateTag("auth");
    revalidateTag("customer");
    redirect(`/`);
}

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

    // cookieStore.set("access_token", "", {
    //     maxAge: -1,
    // });
    // revalidateTag("auth");
    // revalidateTag("customer");
    // redirect(`/`);
}
