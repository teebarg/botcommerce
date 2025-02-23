"use server";

import { cookies } from "next/headers";

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Auth": accessToken ?? "", // Ensure the header is always set
            ...options?.headers,
        },
        cache: "force-cache",
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
}
