"use server";

import { getCookie } from "@/lib/util/server-utils";

export async function bulkUpload(formData: FormData) {
    const accessToken = await getCookie("access_token");

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/upload-products/`, {
            method: "POST",
            body: formData,
            headers: { "X-Auth": accessToken ?? "" },
        });

        if (!response.ok) {
            throw new Error("Failed to upload products");
        }

        return { success: true, message: "Products upload started" };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}
