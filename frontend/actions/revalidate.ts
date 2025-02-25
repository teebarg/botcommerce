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
