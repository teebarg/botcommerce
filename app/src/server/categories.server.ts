import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ProductSearchSchema, type Category } from "@/schemas";
import { api } from "@/utils/fetch-api";


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
