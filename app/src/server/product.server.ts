import { api } from "@/utils/fetch-api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Product, PaginatedProductSearch, Message, ProductVariant, ProductSearch } from "@/schemas";

const SearchParamsSchema = z.object({
    search: z.string().optional(),
    categories: z.string().optional(),
    collections: z.string().optional(),
    min_price: z.union([z.number(), z.string()]).optional(),
    max_price: z.union([z.number(), z.string()]).optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
    show_facets: z.boolean().optional(),
    show_suggestions: z.boolean().optional(),
});

const ProductIdSchema = z.number();
const ProductLimitSchema = z.number().default(20);
const InputAnySchema = z.unknown(); // Used for 'input: any'

// Schema for useUpdateProduct
const UpdateProductPayloadSchema = z.object({
    id: ProductIdSchema,
    input: InputAnySchema,
});

// Schema for useCreateVariant
const CreateVariantInputSchema = z.object({
    productId: ProductIdSchema,
    sku: z.string().optional(),
    price: z.number(),
    old_price: z.number().optional(),
    inventory: z.number(),
    size: z.string().optional(),
    color: z.string().optional(),
});

// Schema for useUpdateVariant
const UpdateVariantInputSchema = z.object({
    id: ProductIdSchema,
    price: z.number().optional(),
    old_price: z.number().optional(),
    inventory: z.number().optional(),
    status: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    measurement: z.number().optional(),
    age: z.string().optional(),
});

// Schema for image upload/delete/reorder
const ImageUploadSchema = z.object({
    id: ProductIdSchema,
    data: InputAnySchema,
});
const ImageDeleteSchema = z.object({
    id: ProductIdSchema,
    imageId: z.number(),
});
const ImageReorderSchema = z.object({
    id: ProductIdSchema,
    imageIds: z.array(z.number()),
});

export const SearchSchema = z.object({
    search: z.string().optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
    show_facets: z.boolean().optional(),
    show_suggestions: z.boolean().optional(),
    cat_ids: z.string().optional(),
    sizes: z.number().optional(),
    colors: z.string().optional(),
    ages: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    collections: z.string().optional(),
});

export const RelatedProductSearchSchema = z.object({
    productId: z.number().optional(),
    limit: z.number().optional(),
});

export const getProductsFn = createServerFn({ method: "GET" })
    .inputValidator(SearchSchema)
    .handler(async ({ data }) => {
        const res = await api.get<PaginatedProductSearch>("/product/", { params: { skip: 0, ...data } });
        return res;
    });

export const productSearchFn = createServerFn({ method: "GET" })
    .inputValidator(SearchParamsSchema)
    .handler(async ({ data: params }) => {
        return await api.get<PaginatedProductSearch>("/product/", { params });
    });


export const getProductFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        const res = await api.get<Product>(`/product/${data}`);
        return res;
    });


export const getRelatedProductFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => RelatedProductSearchSchema.parse(input))
    .handler(async ({ data: { productId, limit = 4 } }) => {
        const res = await api.get<{ similar: ProductSearch[] }>(`/product/${productId}/similar`, { params: { limit } });
        return res;
    });

export const recommendedProductsFn = createServerFn({ method: "GET" })
    .inputValidator(z.object({ limit: ProductLimitSchema }))
    .handler(async ({ data: { limit } }) => {
        return await api.get<{ recommended: ProductSearch[] }>("/product/recommend", { params: { limit } });
    });

export const similarProductsFn = createServerFn({ method: "GET" })
    .inputValidator(z.object({ productId: ProductIdSchema, limit: ProductLimitSchema }))
    .handler(async ({ data: { productId, limit } }) => {
        return await api.get<{ similar: ProductSearch[] }>(`/product/${productId}/similar`, { params: { limit } });
    });


export const createProductFn = createServerFn({ method: "POST" })
    .inputValidator(InputAnySchema)
    .handler(async ({ data: input }) => {
        return await api.post<Product>("/product", input);
    });


export const updateProductFn = createServerFn({ method: "POST" })
    .inputValidator(UpdateProductPayloadSchema)
    .handler(async ({ data: { id, input } }) => {
        return await api.put<Product>(`/product/${id}`, input);
    });

export const deleteProductFn = createServerFn({ method: "POST" })
    .inputValidator(ProductIdSchema)
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/product/${id}`);
    });

export const createVariantFn = createServerFn({ method: "POST" })
    .inputValidator(CreateVariantInputSchema)
    .handler(async ({ data: input }) => {
        const { productId, ...variantData } = input;
        return await api.post<ProductVariant>(`/product/${productId}/variants`, variantData);
    });


export const updateVariantFn = createServerFn({ method: "POST" })
    .inputValidator(UpdateVariantInputSchema)
    .handler(async ({ data: input }) => {
        const { id, ...variantData } = input;
        return await api.put<ProductVariant>(`/product/variants/${id}`, variantData);
    });


export const deleteVariantFn = createServerFn({ method: "POST" })
    .inputValidator(ProductIdSchema)
    .handler(async ({ data: id }) => {
        return await api.delete<Message>(`/product/variants/${id}`);
    });

export const reIndexProductsFn = createServerFn({ method: "POST" })
    .handler(async () => {
        return await api.post<Message>(`/product/reindex`);
    });

export const uploadImageFn = createServerFn({ method: "POST" })
    .inputValidator(ImageUploadSchema)
    .handler(async ({ data: { id, data } }) => {
        return await api.patch<Message>(`/product/${id}/image`, data);
    });

export const uploadImagesFn = createServerFn({ method: "POST" })
    .inputValidator(ImageUploadSchema)
    .handler(async ({ data: { id, data } }) => {
        return await api.post<Message>(`/product/${id}/images`, data);
    });

export const deleteImagesFn = createServerFn({ method: "POST" })
    .inputValidator(ImageDeleteSchema)
    .handler(async ({ data: { id, imageId } }) => {
        return await api.delete<Message>(`/product/${id}/images/${imageId}`);
    });


export const reorderImagesFn = createServerFn({ method: "POST" })
    .inputValidator(ImageReorderSchema)
    .handler(async ({ data: { id, imageIds } }) => {
        return await api.patch<Message>(`/product/${id}/images/reorder`, imageIds);
    });


export const bustCacheFn = createServerFn({ method: "POST" })
    .handler(async () => {
        return await api.post<Message>("/cache/bust", { pattern: "products" });
    });

export const flushCacheFn = createServerFn({ method: "POST" })
    .handler(async () => {
        return await api.post<Message>("/cache/clear", {});
    });


export const createBundleFn = createServerFn({ method: "POST" })
    .inputValidator((d: any) => d)
    .handler(async ({ data }) => {
        return await api.post<any>("/product/create-bundle", data);
    });