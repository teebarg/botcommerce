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
