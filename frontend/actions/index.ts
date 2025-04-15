"use server";

import { cookies } from "next/headers";

export async function create(key: string, value: string, days = 7) {
    const cookieStore = await cookies();

    cookieStore.set(key, value, { secure: true, httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * days });
}
