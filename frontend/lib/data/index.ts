import { cache } from "react";
import { Product, SearchParams } from "types/global";
import { cookies } from "next/headers";
import { buildUrl } from "@lib/util/util";
import { revalidateTag } from "next/cache";

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

    return await response.json();
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

    return await response.json();
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

    return await response.json();
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
        throw new Error(`Failed to create cart: ${error.statusText}`);
    });

    if (!res.ok) {
        throw new Error(`Failed to create cart: ${res.statusText}`);
    }

    return await res.json();
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

        return await response.json();
    } catch (error: any) {
        return { success: false, message: error.toString() };
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

        return await response.json();
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

        return await response.json();
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Unknown error occurred" };
    }
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

        return await res.json();
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

        return await res.json();
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (_e) {
        return null;
    }
}

export async function logOut() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
                accept: "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/`, {
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

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(`Error: ${error}`);
    }
}

export async function addShippingAddress(createData: any) {
    const headers = getHeaders(["addresses"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(createData),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
}

export async function deleteShippingAddress(addressId: string | number) {
    const headers = getHeaders(["customer"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${addressId}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
}

export async function updateShippingAddress(addressId: string, updateData: any) {
    const headers = getHeaders(["addresses"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${addressId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(updateData),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
}

export async function updateBillingAddress(updateData: any) {
    const headers = getHeaders(["addresses"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/billing_address`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                ...headers,
            },
            body: JSON.stringify(updateData),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
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

        return await res.json();
    } catch (error) {
        return { message: error, status: "error" };
    }
});

export const getProductBySlug = async function (slug: string): Promise<any> {
    const headers = getHeaders(["product"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/${slug}`, {
            method: "GET",
            headers: {
                accept: "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        return { message: error, status: "error" };
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

        return await response.json();
    } catch (error) {
        throw error;
    }
});

export const getWishlist = cache(async function (): Promise<any> {
    try {
        const headers = getHeaders(["wishlist"]);

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch wishlist");
        }

        return await response.json();
    } catch (error) {
        return null;
    }
});

export async function addWishlist(product_id: number) {
    const headers = getHeaders(["wishlist"]);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({ product_id }),
    });

    if (!response.ok) {
        throw new Error(`Failed to add product to wishlist: ${response.statusText}`);
    }

    return await response.json();
}

export async function removeWishlist(product_id: number) {
    const headers = getHeaders(["wishlist"]);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/wishlist/${product_id}`;
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to remove item from wishlist: ${response.statusText}`);
    }

    return await response.json();
}

interface SearchResult {
    products: Product[];
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

export async function search(searchParams: SearchParams): Promise<SearchResult> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(searchParams),
            next: {
                tags: ["search"],
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch search");
        }

        return await response.json();
    } catch (_error) {
        return {
            products: [],
            page: 1,
            limit: 20,
            total_count: 0,
            total_pages: 0,
        };
    }
}

export const getCategories = async (search: string = "", page: number = 1, limit: number = 100): Promise<any> => {
    const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`, { search, page, limit });

    revalidateTag("categories");

    try {
        const response = await fetch(url, {
            next: {
                tags: ["categories"],
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }

        return await response.json();
    } catch (error) {
        return { message: error instanceof Error ? error.message : "Error fetching categories" };
    }
};

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
        return { message: error instanceof Error ? error.message : "Error fetching collections" };
    }
});

export const getCollectionBySlug = async (slug: string): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/slug/${slug}`, { next: { tags: ["collection"] } });

        if (!response.ok) {
            console.log(response.statusText);
            throw new Error(response.statusText);
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(`Error fetching collection by slug: ${error.statusText}`);
    }
};

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

export const getActivites = cache(async function (limit: number = 10) {
    const headers = getHeaders(["activities"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities`, {
            method: "GET",
            headers: {
                accept: "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        return { message: error, status: "error" };
    }
});

export async function deleteActivities(id: string | number) {
    const headers = getHeaders(["activities"]);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/${id}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                ...headers,
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json();
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
}
