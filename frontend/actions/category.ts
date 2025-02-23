import { revalidateTag } from "next/cache";

import { api } from "@/api";

export async function mutateCategory(currentState: unknown, formData: FormData) {
    const body: any = {
        name: formData.get("name") as string,
        is_active: Boolean(formData.get("is_active")) ?? false,
    };

    const parent_id = formData.get("parent_id");

    if (parent_id) {
        body["parent_id"] = parent_id as unknown as number;
    }

    const id = formData.get("id") as string;
    const type = formData.get("type") as string;

    try {
        if (type === "create") {
            await api.category.create(body);
        } else {
            await api.category.update(id, body);
        }

        // Revalidate the UI data
        revalidateTag("categories");

        return { success: true, message: "Category created successfully", data: null };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An error occurred" };
    }
}

export async function deleteCategory(id: number) {
    try {
        await api.category.delete(id);

        // Revalidate the UI data
        revalidateTag("categories");

        return { success: true, message: "Category deleted successfully" };
    } catch (error) {
        return { success: false, message: "Error deleting category" };
    }
}
