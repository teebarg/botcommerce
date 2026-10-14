import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import { type ProductFeed, type Product, CategoriesWithProducts, FeedQuerySchema, ProductSearch } from "@/schemas";

interface IndexProducts {
    arrival: ProductSearch[];
    featured: ProductSearch[];
    trending: ProductSearch[];
}

export const getIndexProductsFn = createServerFn().handler(async () => {
    return await api.get<IndexProducts>("/product/index-products");
});

export const getCategoriesProductsFn = createServerFn().handler(async () => {
    return await api.get<CategoriesWithProducts[]>("/category/home/products");
});

export const getProductFeedFn = createServerFn()
    .inputValidator(FeedQuerySchema)
    .handler(async ({ data }) => {
        return await api.get<ProductFeed>("/product/feed", { params: { limit: 40, ...data } });
    });

export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return await api.get<Product>(`/product/${data}`);
    });

export interface CampaignProduct {
    id: number;
    name: string;
    slug: string;
    price: number | null;
    status: string;
    image: string;
}

export interface Campaign {
    title: string;
    products: CampaignProduct[];
}

export const getCampaignFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return await api.get<Campaign>(`/product/campaigns/${data}`);
    });