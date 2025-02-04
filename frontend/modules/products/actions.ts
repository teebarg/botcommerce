"use server";

import { addWishlist, removeWishlist } from "@lib/data";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const getHeaders = (tags: string[] = []) => {
    const headers = {
        next: {
            tags,
        },
    } as Record<string, any>;

    const token = cookies().get("access_token")?.value;

    headers["X-Auth"] = token ?? "";

    return headers;
};

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
        return { success: false, error: error.toString() };
    }
}

export async function addReview(product_id: number, rating: number, comment: string) {
    const headers = getHeaders(["reviews"]);
    // const token = cookies().get("access_token")?.value;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews/`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify({ product_id, rating, comment }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add review to product: ${response.statusText}`);
        }
        revalidateTag("reviews");

        return await response.json();
    } catch (error) {
        return { message: error instanceof Error ? error.message : "Error fetching configs", error: true };
    }
}
