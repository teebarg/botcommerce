// "use server";

import { z } from "zod";

import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { Product, SearchParams } from "@/types/global";

// Define the schema for drafts
const DraftSchema = z.object({
    id: z.string(),
    title: z.string(),
    createdAt: z.string(),
});

const PaginatedDraftsSchema = z.object({
    drafts: z.array(DraftSchema),
    totalPages: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
});

export type Draft = z.infer<typeof DraftSchema>;
export type PaginatedDrafts = z.infer<typeof PaginatedDraftsSchema>;

interface SearchResult {
    products: Product[];
    facets?: {
        brands: Record<string, string>;
        categories: Record<string, string>;
        collections: Record<string, string>;
    };
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

// Draft API methods
export const exampleApi = {
    async hello(name: string): Promise<{ message: string }> {
        return { message: `Hi ${name}, welcome!` };
    },
    async test(searchParams: SearchParams): Promise<SearchResult> {
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { ...searchParams });
        const response = await fetcher<SearchResult>(url);

        console.log("🚀 ~ test ~ response:", response);

        return response;
    },
    async getAll({ query = "", page = 1, pageSize = 10, sort = "desc" }): Promise<PaginatedDrafts> {
        const response = await fetcher<PaginatedDrafts>(
            `${process.env.NEXT_PUBLIC_API_URL}/drafts?query=${query}&page=${page}&pageSize=${pageSize}&sort=${sort}`
        );

        return PaginatedDraftsSchema.parse(response);
    },
};
