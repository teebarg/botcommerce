

import { cache } from "react";
import sortProducts from "@lib/util/sort-products";
import transformProductPreview from "@lib/util/transform-product-preview";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { Product, ProductCategoryWithChildren } from "types/global";
import { cookies } from "next/headers";

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

    const token = cookies().get("_jwt")?.value;

    if (token) {
        headers.authorization = `Bearer ${token}`;
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
    // return client.auth
    //     .getToken(credentials, {
    //         next: {
    //             tags: ["auth"],
    //         },
    //     })
    //     .then(({ access_token }) => {
    //         access_token &&
    //             cookies().set("_jwt", access_token, {
    //                 maxAge: 60 * 60 * 24 * 7,
    //                 httpOnly: true,
    //                 sameSite: "strict",
    //                 secure: process.env.NODE_ENV === "production",
    //             });

    //         return access_token;
    //     })
    //     .catch((err) => {
    //         throw new Error("Wrong email or password." + err);
    //     });
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

    // return client.customers
    //     .retrieve(headers)
    //     .then(({ customer }) => customer)
    //     .catch(() => null);
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

export const getProductByHandle = cache(async function (handle: string): Promise<{ product: any }> {
    const headers = getHeaders(["products"]);

    // const product = await client.products
    //     .list({ handle }, headers)
    //     .then(({ products }) => products[0])
    //     .catch((err) => {
    //         throw err;
    //     });

    // return { product };
    return null;
});

export const getProductsList = cache(async function ({
    pageParam = 0,
    queryParams,
    countryCode,
}: {
    pageParam?: number;
    queryParams?: any;
    countryCode: string;
}): Promise<{
    response: { products: Product[]; count: number };
    nextPage: number | null;
    queryParams?: any;
}> {
    const limit = queryParams?.limit || 12;

    // const { products, count } = await client.products
    //     .list(
    //         {
    //             limit,
    //             offset: pageParam,
    //             region_id: region.id,
    //             ...queryParams,
    //         },
    //         { next: { tags: ["products"] } }
    //     )
    //     .then((res: any) => res)
    //     .catch((err: any) => {
    //         throw err;
    //     });

    // const transformedProducts = products.map((product: any) => {
    //     return transformProductPreview(product, region!);
    // });

    // const nextPage = count > pageParam + 1 ? pageParam + 1 : null;

    // return {
    //     response: { products: transformedProducts, count },
    //     nextPage,
    //     queryParams,
    // };
    return {
        response: {
            products: [],
            count: 0,
        },
        nextPage: null,
        queryParams: {},
    };
});

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
        countryCode,
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

export const getHomepageProducts = cache(async function getHomepageProducts({
    collectionHandles,
    currencyCode,
    countryCode,
}: {
    collectionHandles?: string[];
    currencyCode: string;
    countryCode: string;
}) {
    const collectionProductsMap = new Map<string, Product[]>();

    const { collections } = await getCollectionsList(0, 3);

    if (!collectionHandles) {
        collectionHandles = collections.map((collection: any) => collection.handle);
    }

    for (const handle of collectionHandles ?? []) {
        const products = await getProductsByCollectionHandle({
            handle,
            currencyCode,
            countryCode,
            limit: 3,
        });

        collectionProductsMap.set(handle, products.response.products);
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

export const getCollectionsList = cache(async function (
    offset: number = 0,
    limit: number = 100
): Promise<{ collections: any[]; count: number }> {
    // const collections = await client.collections
    //     .list({ limit, offset }, { next: { tags: ["collections"] } })
    //     .then(({ collections }) => collections)
    //     .catch((err) => {
    //         throw err;
    //     });

    // const count = collections.length;

    // return {
    //     collections,
    //     count,
    // };
    return {
        collections: [],
        count: 0,
    };
});

export const getCollectionByHandle = cache(async function (handle: string): Promise<any> {
    // const collection = await client.collections
    //     .list({ handle: [handle] }, { next: { tags: ["collections"] } })
    //     .then(({ collections }) => collections[0])
    //     .catch((err) => {
    //         throw err;
    //     });

    // return collection;
    return null;
});

export const getProductsByCollectionHandle = cache(async function getProductsByCollectionHandle({
    pageParam = 0,
    limit = 100,
    handle,
    countryCode,
}: {
    pageParam?: number;
    handle: string;
    limit?: number;
    countryCode: string;
    currencyCode?: string;
}): Promise<{
    response: { products: Product[]; count: number };
    nextPage: number | null;
}> {
    const { id } = await getCollectionByHandle(handle).then((collection: any) => collection);

    const { response, nextPage } = await getProductsList({
        pageParam,
        queryParams: { collection_id: [id], limit },
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
    const handles = categoryHandle.map((handle: string, index: number) => categoryHandle.slice(0, index + 1).join("/"));

    const product_categories = [] as ProductCategoryWithChildren[];

    for (const handle of handles) {
        // const category = await client.productCategories
        //     .list(
        //         {
        //             handle: handle,
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
    handle,
    countryCode,
}: {
    pageParam?: number;
    handle: string;
    countryCode: string;
    currencyCode?: string;
}): Promise<{
    response: { products: Product[]; count: number };
    nextPage: number | null;
}> {
    const { id } = await getCategoryByHandle([handle]).then((res: any) => res.product_categories[0]);

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
