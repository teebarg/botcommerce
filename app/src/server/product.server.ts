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
