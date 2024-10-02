import { cache } from "react";
import { Product, ProductCategoryWithChildren } from "types/global";
import { cookies } from "next/headers";
import { buildUrl } from "@lib/util/util";
import { searchDocuments } from "@lib/util/meilisearch";

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

    headers["X-Auth"] = token ?? "";

    return headers;
};

// Cart actions
export async function createCart(data = {}) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/create`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to create cart: ${response.statusText}`);
    }

    const cart = await response.json();

    return cart;
}

export async function updateCart(cartId: string, data: any) {
    const headers = getHeaders(["cart"]);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update-cart-details`;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...headers,
            cartId,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update cart: ${response.statusText}`);
    }

    const updatedCart = await response.json();

    return updatedCart;
}

export const getCart = cache(async function (cartId: string) {
    const headers = getHeaders(["cart"]);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...headers,
            cartId,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to create cart: ${response.statusText}`);
    }

    const cart = await response.json();

    return cart;
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

export async function addItem({ cartId, product_id, quantity }: { cartId: string; product_id: string; quantity: number }) {
    try {
        const headers = getHeaders(["cart"]);
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/add`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
                cartId,
            },
            body: JSON.stringify({ product_id, quantity }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add item to cart: ${response.statusText}`);
        }

        const result = await response.json();

        return result;
    } catch (error) {
        console.log(error);

        return { success: false, message: "error" };
    }
}

export async function updateItem({ cartId, lineId, quantity }: { cartId: string; lineId: string; quantity: number }) {
    const headers = getHeaders(["cart"]);

    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
                cartId,
            },
            body: JSON.stringify({ product_id: lineId, quantity }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add item to cart: ${response.statusText}`);
        }

        const result = await response.json();

        return result;
    } catch (e) {
        return "Error adding item to cart";
    }
}

export async function removeItem({ cartId, lineId }: { cartId: string; lineId: string }) {
    const headers = getHeaders(["cart"]);

    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${lineId}`;
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...headers,
                cartId,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to remove item from cart: ${response.statusText}`);
        }

        const result = await response.json();

        return result;
    } catch (error) {
        console.log(error);

        return { success: false, message: "error" };
    }
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

export async function setPaymentSession({ cartId, providerId }: { cartId: string; providerId: string }) {
    const headers = getHeaders(["cart"]);

    // return client.carts
    //     .setPaymentSession(cartId, { provider_id: providerId }, headers)
    //     .then(({ cart }) => cart)
    //     .catch((err) => Error(err));
}

export async function completeCart(cartId: string) {
    const headers = getHeaders(["cart"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
                cartId,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const data = await res.json();

        return data;
    } catch (error) {
        return { message: error, status: "error" };
    }
}

// Order actions
export const retrieveOrder = cache(async function (id: string) {
    const headers = getHeaders(["order"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const data = await res.json();

        return data;
    } catch (error) {
        return { message: error, status: "error" };
    }
});

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


// Customer actions
export async function getAdresses() {
    const headers = getHeaders(["addresses"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`${res.statusText}`);
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
    const headers = getHeaders(["orders"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const data = await res.json();

        return data;
    } catch (error) {
        return { message: error, status: "error" };
    }
});

export const getProductBySlug = async function (slug: string): Promise<any> {
    try {
        const { hits } = await searchDocuments<Product>("products", "", {
            filter: `slug = "${slug}"`,
            limit: 1,
        });

        if (hits.length == 0) return null;

        return hits[0];
    } catch (error) {
        return null;
    }
};

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
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/slug/${slug}`, { next: { tags: ["collection"] } });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const collection = await response.json();

        return collection;
    } catch (error) {
        console.error("Error fetching collection by slug:", error);

        return null;
    }
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
