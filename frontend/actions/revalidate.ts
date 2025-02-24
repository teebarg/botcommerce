"use server";

import { revalidateTag } from "next/cache";

export async function revalidateProducts() {
    revalidateTag("products");
}

export async function revalidateProduct() {
    revalidateTag("product");
}

export async function revalidateUser() {
    revalidateTag("user");
}

export async function revalidateCart() {
    revalidateTag("cart");
}

export async function revalidate(tag: string) {
    revalidateTag(tag);
}
