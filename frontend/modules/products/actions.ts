"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const getHeaders = async (tags: string[] = []) => {
    const headers = {
        next: {
            tags,
        },
    } as Record<string, any>;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    headers["X-Auth"] = token ?? "";

    return headers;
};

export async function addReview(product_id: number, rating: number, comment: string) {
    const headers = await getHeaders(["reviews"]);
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
