"use server";

import { cookies } from "next/headers";

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    let cartId = cookieStore.get("_cart_id")?.value;

    const res = await fetch(url, {
        ...options,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-Auth": accessToken ?? "", // Ensure the header is always set
            cartId: cartId ?? "",
            ...options?.headers,
        },
        cache: options?.method == null || options?.method === "GET" ? "force-cache" : "no-store",
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();

        throw new Error(error.detail || error.message || `API Error: ${res.statusText}`);
    }

    return res.json();
}
