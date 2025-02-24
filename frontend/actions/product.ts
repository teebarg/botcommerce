"use server";

import { api } from "@/apis";

export async function mutateProduct(currentState: unknown, formData: FormData) {
    const id = formData.get("id") as string;
    const type = formData.get("type") as string;
    const productData: any = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        image: formData.get("image") as string,
        is_active: Boolean(formData.get("is_active")) ?? false,
        description: formData.get("description") as string,
        brands: JSON.parse(formData.get("brands") as string) ?? [],
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
