import { api } from "@/apis";

export async function mutateCategory(currentState: unknown, formData: FormData) {
    const body: { name: string; is_active: boolean; parent_id?: number } = {
        name: formData.get("name") as string,
        is_active: Boolean(formData.get("is_active")) ?? false,
    };

    const id = formData.get("id") as unknown as number;
    const type = formData.get("type") as string;

    let response;

    if (type === "create") {
        const parent_id = formData.get("parent_id");

        if (parent_id) {
            body["parent_id"] = parent_id as unknown as number;
        }
        response = await api.category.create(body);
    } else {
        response = await api.category.update(id, body);
    }

    if (response.error) {
        return { success: false, message: response.error, data: null };
    }

    return { success: true, message: "Category created successfully", data: response.data };
}

export async function deleteCategory(id: number) {
    try {
        await api.category.delete(id);

        return { success: true, message: "Category deleted successfully" };
    } catch (error) {
        return { success: false, message: "Error deleting category" };
    }
}
