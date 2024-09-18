import { cache } from "react";
import sortProducts from "@lib/util/sort-products";
import transformProductPreview from "@lib/util/transform-product-preview";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { Product, ProductCategoryWithChildren } from "types/global";
import { cookies } from "next/headers";
import { buildUrl } from "@lib/util/util";
import { searchDocuments } from "@lib/util/meilisearch";

const emptyResponse = {
    response: { products: [], count: 0 },
    nextPage: null,
};

/**
 * Function for getting custom headers for API requests, including the JWT token and cache revalidation tags.
 *
 * @param tags
 * @returns custom headers for API requests
 */
const getHeaders = (tags: string[] = []) => {
    const headers = {
        next: {
            tags,
        },
    } as Record<string, any>;

    const token = cookies().get("access_token")?.value;

    if (token) {
        headers["X-Auth"] = token;
    } else {
        headers.authorization = "";
    }

    return headers;
};

// Cart actions
export async function createCart(data = {}) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .create(data, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => {
    //         console.error(err);

    //         return null;
    //     });
}

export async function updateCart(cartId: string, data: any) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .update(cartId, data, headers)
    //     .then(({ cart }) => cart)
    //     .catch((error) => Error(error));
}

export const getCart = cache(async function (cartId: string) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .retrieve(cartId, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
});

export const getProducts = cache(async function (search?: string, collections?: string, page?: number, limit?: number) {
    const headers = getHeaders([]);
    const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { search, collections, page, limit });
    const res = await fetch(url, {
        next: {
            tags: ["products"],
        },
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    }).catch((error) => {
        console.error("Error fetching products:", error);
        return null;
    });

    if (!res) {
        return null;
    }

    const data = await res.json();
    return data;
});

export async function addItem({ cartId, quantity }: { cartId: string; quantity: number }) {
    const headers = getHeaders(["cart"]);

    // return client.carts.lineItems
    //     .create(cartId, { variant_id: variantId, quantity }, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
}

export async function updateItem({ cartId, lineId, quantity }: { cartId: string; lineId: string; quantity: number }) {
    const headers = getHeaders(["cart"]);

    // return client.carts.lineItems
    //     .update(cartId, lineId, { quantity }, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => Error(err));
}

export async function removeItem({ cartId, lineId }: { cartId: string; lineId: string }) {
    const headers = getHeaders(["cart"]);

    // return client.carts.lineItems
    //     .delete(cartId, lineId, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
}

export async function deleteDiscount(cartId: string, code: string) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .deleteDiscount(cartId, code, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
}

export async function createPaymentSessions(cartId: string) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .createPaymentSessions(cartId, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
}

export async function setPaymentSession({ cartId, providerId }: { cartId: string; providerId: string }) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .setPaymentSession(cartId, { provider_id: providerId }, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => Error(err));
}

export async function completeCart(cartId: string) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .complete(cartId, headers)
    //     .then((res) => res)
    //     .catch((err) => Error(err));
}

// Order actions
export const retrieveOrder = cache(async function (id: string) {
    const headers = getHeaders(["order"]);

    // return client.orders
    //     .retrieve(id, headers)
    //     .then(({ order }) => order)
    //     .catch((err) => Error(err));
});

// Shipping actions
export const listCartShippingMethods = cache(async function (cartId: string) {
    const headers = getHeaders(["shipping"]);

    // return client.shippingOptions
    //     .listCartOptions(cartId, headers)
    //     .then(({ shipping_options }) => shipping_options)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
});

export async function addShippingMethod({ cartId, shippingMethodId }: { cartId: string; shippingMethodId: string }) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .addShippingMethod(cartId, { option_id: shippingMethodId }, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => Error(err));
}

// Authentication actions
export async function getToken(credentials: any) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            next: {
                tags: ["auth"],
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const { access_token } = await response.json();

        if (access_token) {
            cookies().set("access_token", access_token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });
        }

        return access_token;
    } catch (error) {
        console.error("Login error:", error);
        throw new Error("Wrong email or password.");
    }
}

export async function authenticate(credentials: any) {
    const headers = getHeaders(["auth"]);

    // return client.auth
    //     .authenticate(credentials, headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
}

export const getSession = cache(async function getSession() {
    const headers = getHeaders(["auth"]);

    // return client.auth
    //     .getSession(headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
});

// Customer actions
export async function getCustomer() {
    const headers = getHeaders(["customer"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            credentials: "include",
        });
        if (!res.ok) {
            throw new Error("Login failed");
        }

        return await res.json();
    } catch (error) {
        return null;
    }
}

export async function createCustomer(data: any) {
    const headers = getHeaders(["customer"]);

    // return client.customers
    //     .create(data, headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
}

export async function updateCustomer(data: any) {
    const headers = getHeaders(["customer"]);

    // return client.customers
    //     .update(data, headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
}

export async function addShippingAddress(data: any) {
    const headers = getHeaders(["customer"]);

    // return client.customers.addresses
    //     .addAddress(data, headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
}

export async function deleteShippingAddress(addressId: string) {
    const headers = getHeaders(["customer"]);

    // return client.customers.addresses
    //     .deleteAddress(addressId, headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
}

export async function updateShippingAddress(addressId: string, data: any) {
    const headers = getHeaders(["customer"]);

    // return client.customers.addresses
    //     .updateAddress(addressId, data, headers)
    //     .then(({ customer }) => customer)
    //     .catch((err) => Error(err));
}

export const listCustomerOrders = cache(async function (limit: number = 10, offset: number = 0) {
    const headers = getHeaders(["customer"]);

    // return client.customers
    //     .listOrders({ limit, offset }, headers)
    //     .then(({ orders }) => orders)
    //     .catch((err) => Error(err));
});

// Region actions
export const listRegions = cache(async function () {
    // return client.regions
    //     .list()
    //     .then(({ regions }) => regions)
    //     .catch((err) => {
    //         console.log(err);
    //         return null;
    //     });
});

export const retrieveRegion = cache(async function (id: string) {
    const headers = getHeaders(["regions"]);

    // return client.regions
    //     .retrieve(id, headers)
    //     .then(({ region }) => region)
    //     .catch((err) => Error(err));
});

const regionMap = new Map<string, any>();

export const getRegion = cache(async function (countryCode: string) {
    try {
        if (regionMap.has(countryCode)) {
            return regionMap.get(countryCode);
        }

        const regions = await listRegions();

        if (!regions) {
            return null;
        }

        regions.forEach((region: any) => {
            region.countries.forEach((c: any) => {
                regionMap.set(c.iso_2, region);
            });
        });

        const region = countryCode ? regionMap.get(countryCode) : regionMap.get("ng");

        return region;
    } catch (e: any) {
        console.log(e.toString());

        return null;
    }
});

// Product actions
export const getProductsById = cache(async function ({ ids, regionId }: { ids: string[]; regionId: string }) {
    const headers = getHeaders(["products"]);

    // return client.products
    //     .list({ id: ids, region_id: regionId }, headers)
    //     .then(({ products }) => products)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
});

export const retrievePricedProductById = cache(async function ({ id, regionId }: { id: string; regionId?: string }) {
    const headers = getHeaders(["products"]);

    // return client.products
    //     .retrieve(`${id}?region_id=${regionId}`, headers)
    //     .then(({ product }) => product)
    //     .catch((err) => {
    //         console.log(err);

    //         return null;
    //     });
});

export const getProduct = cache(async function (slug: string): Promise<any> {
    try {
        const headers = getHeaders(["products"]);

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${slug}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        return await response.json();
    } catch (error) {
        return null;
    }
});

export const getProductsList = cache(async function (queryParams: any): Promise<any> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search`;
    // const headers = getHeaders([]);

    console.log(queryParams);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // ...headers,
            },
            body: JSON.stringify(queryParams),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
});

interface SearchParams {
    query?: string;
    collections?: string[];
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
    sort?: string;
}

interface SearchResult {
    products: Product[];
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

export async function searchProducts(searchParams: SearchParams): Promise<SearchResult> {
    const { query = "", collections = [], min_price = 1, max_price = 1000000, page = 1, limit = 20, sort = "created_at:desc" } = searchParams;

    const filters: string[] = [];
    if (collections.length > 0) {
        filters.push(`collections IN [${collections.join(",")}]`);
    }
    if (min_price && max_price) {
        filters.push(`price >= ${min_price} AND price <= ${max_price}`);
    }

    const meilisearchParams: Record<string, any> = {
        limit: limit,
        offset: (page - 1) * limit,
        sort: [sort],
    };

    if (filters.length > 0) {
        meilisearchParams.filter = filters.join(" AND ");
    }

    const searchResults = await searchDocuments<Product>("products", query, meilisearchParams);

    const totalCount = searchResults.estimatedTotalHits || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        products: searchResults.hits,
        page: page,
        limit: limit,
        total_count: totalCount,
        total_pages: totalPages,
    };
}

export const getProductsListWithSort = cache(async function getProductsListWithSort({
    page = 0,
    queryParams,
    sortBy = "created_at",
    countryCode,
}: {
    page?: number;
    queryParams?: any;
    sortBy?: SortOptions;
    countryCode: string;
}): Promise<{
    response: { products: Product[]; count: number };
    nextPage: number | null;
    queryParams?: any;
}> {
    const limit = queryParams?.limit || 12;

    const {
        response: { products, count },
    } = await getProductsList({
        pageParam: 0,
        queryParams: {
            ...queryParams,
            limit: 100,
        },
    });

    const sortedProducts = sortProducts(products, sortBy);

    const pageParam = (page - 1) * limit;

    const nextPage = count > pageParam + limit ? pageParam + limit : null;

    const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit);

    return {
        response: {
            products: paginatedProducts,
            count,
        },
        nextPage,
        queryParams,
    };
});

export const getHomepageProducts = cache(async function getHomepageProducts({ collectionHandles }: { collectionHandles?: string[] }) {
    const collectionProductsMap = new Map<string, Product[]>();

    const { collections } = await getCollectionsList(0, 3);

    if (!collectionHandles) {
        collectionHandles = collections.map((collection: any) => collection.slug);
    }

    console.log("collection handles");
    console.log(collectionHandles);

    for (const slug of collectionHandles ?? []) {
        const products = await getProductsByCollectionHandle({
            slug,
            limit: 3,
        });

        collectionProductsMap.set(slug, products.response.products);
    }

    return collectionProductsMap;
});

// Collection actions
export const retrieveCollection = cache(async function (id: string) {
    // return client.collections
    //     .retrieve(id, {
    //         next: {
    //             tags: ["collections"],
    //         },
    //     })
    //     .then(({ collection }) => collection)
    //     .catch((err) => {
    //         throw err;
    //     });
});

export const getCollectionsList = cache(async function (search: string = "", page: number = 1, limit: number = 100): Promise<any> {
    const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/`, { search, page, limit });
    try {
        const response = await fetch(url, {
            next: {
                tags: ["collections"],
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch collections");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching collections:", error);
        return { message: "Error fetching collections" };
    }
});

export const getCollectionBySlug = cache(async function (slug: string): Promise<any> {
    console.log("slug-------------");
    console.log(slug);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/slug/${slug}`, { next: { tags: ["collection"] } });

        if (!response.ok) {
            throw new Error("Failed to fetch collection");
        }

        const collection = await response.json();
        return collection;
    } catch (error) {
        console.error("Error fetching collection by slug:", error);
        return null;
    }
});

export const getProductsByCollectionHandle = cache(async function getProductsByCollectionHandle({
    page = 1,
    slug,
    limit = 1,
}: {
    page?: number;
    slug: string;
    limit: number;
}): Promise<any> {
    const { id } = await getCollectionBySlug(slug).then((collection: any) => collection);

    const res = await getProductsList({ collections: [id], page })
        .then((res: any) => res)
        .catch((err: any) => {
            throw err;
        });

    return res;
});

// Category actions
export const listCategories = cache(async function () {
    const headers = {
        next: {
            tags: ["collections"],
        },
    } as Record<string, any>;

    // return client.productCategories
    //     .list({ expand: "category_children" }, headers)
    //     .then(({ product_categories }) => product_categories)
    //     .catch((err) => {
    //         throw err;
    //     });
});

export const getCategoriesList = cache(async function (
    offset: number = 0,
    limit: number = 100
): Promise<{
    product_categories: ProductCategoryWithChildren[];
    count: number;
}> {
    // const { product_categories, count } = await client.productCategories
    //     .list({ limit, offset }, { next: { tags: ["categories"] } })
    //     .catch((err) => {
    //         throw err;
    //     });

    // return {
    //     product_categories,
    //     count,
    // };
    return {
        product_categories: [],
        count: 0,
    };
});

export const getCategoryByHandle = cache(async function (categoryHandle: string[]): Promise<any> {
    const handles = categoryHandle.map((slug: string, index: number) => categoryHandle.slice(0, index + 1).join("/"));

    const product_categories = [] as ProductCategoryWithChildren[];

    for (const slug of handles) {
        // const category = await client.productCategories
        //     .list(
        //         {
        //             slug: slug,
        //         },
        //         {
        //             next: {
        //                 tags: ["categories"],
        //             },
        //         }
        //     )
        //     .then(({ product_categories: { [0]: category } }) => category)
        //     .catch(() => {
        //         return {} as any;
        //     });
        // product_categories.push(category);
    }

    return {
        product_categories,
    };
});

export const getProductsByCategoryHandle = cache(async function ({
    pageParam = 0,
    slug,
    countryCode,
}: {
    pageParam?: number;
    slug: string;
    countryCode: string;
    currencyCode?: string;
}): Promise<{
    response: { products: Product[]; count: number };
    nextPage: number | null;
}> {
    const { id } = await getCategoryByHandle([slug]).then((res: any) => res.product_categories[0]);

    const { response, nextPage } = await getProductsList({
        pageParam,
        queryParams: { category_id: [id] },
        countryCode,
    })
        .then((res: any) => res)
        .catch((err: any) => {
            throw err;
        });

    return {
        response,
        nextPage,
    };
});
