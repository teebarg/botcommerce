"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function indexProducts() {
    // const headers = getHeaders([]);
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/reindex`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth": accessToken,
                // ...headers,
            },
            body: JSON.stringify({ access_token: accessToken }),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error creating product index:", error);

        return null;
    }
}

export async function exportProducts() {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/export`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "X-Auth": accessToken,
            },
        });

        if (!res.ok) {
            return { success: false, message: res.statusText };
        }

        return { success: true, message: "Products exported successfully" };
    } catch (error) {
        console.error("Error exporting products:", error);

        return { success: false, message: "Error exporting products" };
    }
}

export async function uploadProductImage({ productId, formData }: { productId: string; formData: FormData }) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${productId}/image`;

    try {
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "X-Auth": accessToken,
            },
            body: formData,
        });

        if (!res.ok) {
            return { success: false, message: "Error uploading product image" };
        }

        // Revalidate the UI data
        revalidateTag("products");
        revalidateTag("campaigns");

        return { success: true, message: "Image upload successful", data: await res.json() };
    } catch (error) {
        console.error("Error uploading product image:", error);

        return { success: false, message: "Error uploading product image" };
    }
}

export async function createProduct(currentState: unknown, formData: FormData) {
    const accessToken = cookies().get("access_token")?.value as string;
    // const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`;
    const productId = formData.get("id") as string;
    const type = formData.get("type") as string;

    const url =
        type === "create" ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/` : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${productId}`;

    const productData = {
        name: formData.get("name"),
        is_active: Boolean(formData.get("is_active")) ?? false,
        description: formData.get("description"),
        // tags: JSON.parse(formData.get("tags") as string) ?? [],
        categories: JSON.parse(formData.get("categories") as string) ?? [],
        collections: JSON.parse(formData.get("collections") as string) ?? [],
        price: formData.get("price") ?? 0,
        old_price: formData.get("old_price") ?? 0,
    };

    try {
        const res = await fetch(url, {
            method: type === "create" ? "POST" : "PATCH",
            headers: {
                "X-Auth": accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!res.ok) {
            return { success: false, message: "Error creating product" };
        }

        // Revalidate the UI data
        revalidateTag("products");
        revalidateTag("campaigns");

        return { success: true, message: "Product created successfully", data: await res.json() };
    } catch (error) {
        return { success: false, message: "Error creating product" };
    }
}

export async function deleteProduct(productId: string) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${productId}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "X-Auth": accessToken,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("products");

        return { success: true, message: "Product deleted successfully" };
    } catch (error) {
        return { success: false, message: "Error deleting product" };
    }
}

export async function createCategory(currentState: unknown, formData: FormData) {
    const accessToken = cookies().get("access_token")?.value as string;
    const categoryUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category`;

    const id = formData.get("id");
    const type = formData.get("type") as string;

    const url = type === "create" ? `${categoryUrl}/` : `${categoryUrl}/${id}`;

    const body: Record<string, any> = {
        name: formData.get("name"),
        is_active: Boolean(formData.get("is_active")) ?? false,
    };

    const parent_id = formData.get("parent_id");

    if (parent_id) {
        body["parent_id"] = parent_id;
    }

    try {
        const res = await fetch(url, {
            method: type === "create" ? "POST" : "PATCH",
            headers: {
                "X-Auth": accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        // Revalidate the UI data
        revalidateTag("categories");

        return { success: true, message: "Category created successfully", data: await res.json() };
    } catch (error) {
        console.error("Error creating category:", error);

        return { success: false, message: "Error creating category" };
    }
}

export async function deleteCategory(id: number) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/${id}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "X-Auth": accessToken,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("categories");

        return { success: true, message: "Category deleted successfully" };
    } catch (error) {
        return { success: false, message: "Error deleting category" };
    }
}

export async function createCollection(currentState: unknown, formData: FormData) {
    const accessToken = cookies().get("access_token")?.value as string;
    const collectionUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection`;

    const id = formData.get("id");
    const type = formData.get("type") as string;

    const url = type === "create" ? `${collectionUrl}/` : `${collectionUrl}/${id}`;

    try {
        const res = await fetch(url, {
            method: type === "create" ? "POST" : "PATCH",
            headers: {
                "X-Auth": accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.get("name"),
                is_active: Boolean(formData.get("is_active")) ?? false,
            }),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        // Revalidate the UI data
        revalidateTag("collections");

        return { success: true, message: "Collection created successfully", data: await res.json() };
    } catch (error) {
        console.error("Error creating collection:", error);

        return { success: false, message: "Error creating collection" };
    }
}

export async function updateCollection(collectionId: string, collectionData: any) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${collectionId}`;

    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "X-Auth": accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(collectionData),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("collections");

        return { success: true, message: "Collection updated successfully", data: await res.json() };
    } catch (error) {
        console.error("Error updating collection:", error);

        return { success: false, message: "Error updating collection" };
    }
}

export async function deleteCollection(collectionId: string) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/${collectionId}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "X-Auth": accessToken,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("collections");

        return { success: true, message: "Collection deleted successfully" };
    } catch (error) {
        console.error("Error deleting collection:", error);

        return { success: false, message: "Error deleting collection" };
    }
}

export async function getCollections(page: number = 1, limit: number = 10) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/?page=${page}&limit=${limit}`;

    try {
        const res = await fetch(url, {
            headers: {
                "X-Auth": accessToken,
            },
            next: {
                tags: ["collections"],
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching collections:", error);

        return null;
    }
}

export async function bulkUploadProducts({ formData }: { formData: FormData }) {
    const accessToken = cookies().get("access_token")?.value as string;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/upload-products/`, {
            method: "POST",
            body: formData,
            headers: {
                "X-Auth": accessToken,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }
        // Revalidate the UI data
        revalidateTag("products");

        return await res.json();
    } catch (e) {
        console.error("Error during bulk product update:", e);

        return "Error updating products";
    }
}
