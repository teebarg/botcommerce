"use server";

import { getCookie } from "@/lib/util/server-utils";

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const accessToken = await getCookie("access_token");
    const cartId = await getCookie("_cart_id");

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
