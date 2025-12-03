import { serverApi } from "@/apis/server-client";
import { PaginatedProductSearch } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const SearchSchema = z.object({
    search: z.string().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
    show_facets: z.boolean().optional(),
    show_suggestions: z.boolean().optional(),
    // cat_ids: z.string().optional(),
    sizes: z.string().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
});

export const GetProductsFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => SearchSchema.parse(input))
    .handler(async ({ data }) => {
        console.log("🚀 ~ file: product.server.ts:8 ~ data:-----", data);
        const res = await serverApi.get<PaginatedProductSearch>("/product/", { params: { skip: 0, ...data } });
        console.log("🚀 ~ file: product.server.ts:26 ~ res:", res)
        return res;
    });
