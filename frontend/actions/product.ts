"use server";

import { api } from "@/apis";

export async function mutateProduct(currentState: unknown, formData: FormData) {
    const id = formData.get("id") as unknown as number;

    if (!id) {
        return;
    }
    const type = formData.get("type") as string;
    const productData: any = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        // image: formData.get("image") as string,
        is_active: Boolean(formData.get("is_active")) ?? false,
        description: formData.get("description") as string,
        brand_id: formData.get("brand_id") as string,
        categories: JSON.parse(formData.get("categories") as string) ?? [],
        collections: JSON.parse(formData.get("collections") as string) ?? [],
        price: Number(formData.get("price")) ?? 0,
        old_price: Number(formData.get("old_price")) ?? 0,
    };

    if (type === "create") {
        await api.product.create(productData);
    } else {
        await api.product.update(id, productData);
    }

    return { success: true, message: "Product updated successfully", data: null };
}

export async function mutateBrand(currentState: unknown, formData: FormData) {
    const data: any = {
        name: formData.get("name"),
        is_active: Boolean(formData.get("is_active")) ?? false,
    };
    const id = formData.get("id") as string;
    const type = formData.get("type") as string;

    let response;

    if (type === "create") {
        response = await api.brand.create(data);
    } else {
        response = await api.brand.update(id, data);
    }

    if (response.error) {
        return { success: false, message: response.error, data: null };
    }

    return { success: true, message: "successful", data: response.data };
}

export async function mutateCollection(currentState: unknown, formData: FormData) {
    const data: any = {
        name: formData.get("name"),
        is_active: Boolean(formData.get("is_active")) ?? false,
    };

    const id = formData.get("id") as string;
    const type = formData.get("type") as string;

    let response;

    if (type === "create") {
        response = await api.collection.create(data);
    } else {
        response = await api.collection.update(id, data);
    }

    if (response.error) {
        return { success: false, message: response.error, data: null };
    }

    return { success: true, message: "successful", data: response.data };
}

export async function mutateSiteConfig(currentState: unknown, formData: FormData) {
    const data: any = {
        key: formData.get("key"),
        value: formData.get("value"),
    };

    const id = formData.get("id") as string;
    const type = formData.get("type") as string;

    if (type === "create") {
        return await api.config.create(data);
    } else {
        return await api.config.update(id, data);
    }
}
