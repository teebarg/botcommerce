import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverApi } from "@/apis/server-client";
import { Category, Message } from "@/schemas";

export const CategorySchema = z.object({
    query: z.string().optional(),
});

export const CategoryFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean().default(true),
    parent_id: z.number().nullable().optional(),
});

const UpdateCategorySchema = z.object({
    id: z.string(),
    data: CategoryFormSchema,
});

export const GetCategoriesFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => CategorySchema.parse(input))
    .handler(async ({ data }) => {
        return await serverApi.get<Category[]>("/category/", { params: { query: data.query ?? "" } });
    });

export const createCategoryFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => CategoryFormSchema.parse(input))
    .handler(async ({ data }) => {
        return await serverApi.post<Category>("/category/", {
            ...data,
        });
    });

export const updateCategoryFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => UpdateCategorySchema.parse(input))
    .handler(async ({ data }) => {
        const { id, data: body } = data;

        return await serverApi.patch<Category>(`/category/${id}`, body);
    });

export const deleteCategoryFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) =>
        z
            .object({
                id: z.string(),
            })
            .parse(input)
    )
    .handler(async ({ data }) => {
        const { id } = data;
        return await serverApi.delete<Message>(`/category/${id}`);
    });
