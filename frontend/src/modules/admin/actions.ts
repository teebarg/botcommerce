"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function indexProducts() {
    // const headers = getHeaders([]);
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/reindex`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Auth": accessToken,
                // ...headers,
            },
            body: JSON.stringify({access_token: accessToken}),
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
            method: 'GET',
            headers: {
                "X-Auth": accessToken,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
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
            method: 'POST',
            headers: {
                "X-Auth": accessToken,
            },
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("products");

        return await res.json();
    } catch (error) {
        console.error("Error uploading product image:", error);
        return { success: false, message: "Error uploading product image" };
    }
}

export async function createProduct(currentState: unknown, formData: FormData) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`;
    
    const productData = {
        name: formData.get("name"),
        is_active: Boolean(formData.get("is_active")) ?? false,
        description: formData.get("description"),
        tags: JSON.parse(formData.get("tags") as string) ?? [],
        collections: JSON.parse(formData.get("collections") as string) ?? [],
        price: formData.get("price") ?? 0,
        old_price: formData.get("old_price") ?? 0,
    };
    console.log(productData);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                "X-Auth": accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("products");

        return { success: true, message: "Product created successfully", data: await res.json() };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, message: "Error creating product" };
    }
}

export async function updateProduct(productId: string, productData: any) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${productId}`;
    
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                "X-Auth": accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Revalidate the UI data
        revalidateTag("products");

        return { success: true, message: "Product updated successfully", data: await res.json() };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, message: "Error updating product" };
    }
}

export async function createCollection(collectionData: any) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
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
            method: 'PUT',
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
            method: 'DELETE',
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

export async function getCollections(page: number = 1, perPage: number = 10) {
    const accessToken = cookies().get("access_token")?.value as string;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection?page=${page}&per_page=${perPage}`;
    
    try {
        const res = await fetch(url, {
            headers: {
                "X-Auth": accessToken,
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





export async function bulkUploadProducts({ id, formData }: { id: string; formData: any }) {
    try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/product/excel/${id}`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        if (!res.ok) {
            const errorText = await res.text();
            return null;
        }
        // Revalidate the UI data
        revalidateTag("products");
        return await res.json();
        
        // // Revalidate the UI data
        // revalidateTag("products");
        
        // return "Bulk product update successful";
    } catch (e) {
        console.error("Error during bulk product update:", e);
        return "Error updating products";
    }
}