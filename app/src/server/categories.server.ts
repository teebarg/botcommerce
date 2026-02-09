import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ProductSearchSchema, type Category, type Message } from "@/schemas";
import { api } from "@/utils/fetch-api";

const ReorderCategoriesSchema = z.object({
    categories: z.array(
        z.object({
            id: z.number(),
            display_order: z.number(),
        })
    ),
});

export const CategorySchema = z.object({
    query: z.string().optional(),
});

export const CategoryFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean().default(true),
    parent_id: z.number().nullable().optional(),
});

const UpdateCategorySchema = z.object({
    id: z.number(),
    data: CategoryFormSchema,
});

const UpdateCategoryImageSchema = z.object({
    id: z.number(),
    file: z.string(),
    file_name: z.string(),
    content_type: z.string(),
});


export const CategoriesProductsSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    products: z.array(ProductSearchSchema),
    created_at: z.string(),
    updated_at: z.string(),
});

export type CategoriesWithProducts = z.infer<typeof CategoriesProductsSchema>;


export const getCategoriesFn = createServerFn({ method: "GET" })
    .inputValidator(z.string().optional())
    .handler(async ({ data: query }) => {
        return await api.get<Category[]>(`/category/`, { params: { query: query ?? "" } });
    });

export const createCategoryFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => CategoryFormSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.post<Category>("/category/", data);
    });

export const updateCategoryFn = createServerFn({ method: "POST" }) // RPC call uses POST
    .inputValidator((input: unknown) => UpdateCategorySchema.parse(input))
    .handler(async ({ data }) => {
        const { id, data: body } = data;
        return await api.patch<Category>(`/category/${id}`, body);
    });

export const deleteCategoryFn = createServerFn({ method: "POST" }) // RPC call uses POST
    .inputValidator(z.number()) // ID of the category to delete
    .handler(async ({ data: id }) => {
        return await api.delete<Category>(`/category/${id}`);
    });

export const reorderCategoriesFn = createServerFn({ method: "POST" })
    .inputValidator(ReorderCategoriesSchema)
    .handler(async ({ data }) => {
        return await api.patch<Category>(`/category/reorder`, data);
    });

export const updateCategoryImageFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => UpdateCategoryImageSchema.parse(input))
    .handler(async ({ data }) => {
        const { id, ...body } = data;
        return await api.patch<Message>(`/category/${id}/image`, body);
    });

export const deleteCategoryImageFn = createServerFn({ method: "POST" })
    .inputValidator(z.number())
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/category/${id}/image`);
    });
