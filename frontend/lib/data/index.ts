import { cache } from "react";
import { cookies } from "next/headers";
import { buildUrl } from "@lib/util/util";

/**
 * Function for getting custom headers for API requests, including the JWT token and cache revalidation tags.
 *
 * @param tags
 * @returns custom headers for API requests
 */
const getHeaders = async (tags: string[] = []) => {
    const headers = {
        next: {
            tags,
        },
    } as Record<string, any>;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

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
    const headers = await getHeaders(["cart"]);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update-cart-details`;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update cart: ${response.statusText}`);
    }

    return await response.json();
}

export const getCart = cache(async function (cartId: string) {
    const headers = await getHeaders(["cart"]);
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

export async function addItem({ cartId, product_id, quantity }: { cartId: string; product_id: string; quantity: number }) {
    try {
        const headers = await getHeaders(["cart"]);
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
    const headers = await getHeaders(["cart"]);

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
    const headers = await getHeaders(["cart"]);

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
    const headers = await getHeaders(["cart"]);

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
    const headers = await getHeaders(["order"]);

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

// Customer actions
export async function getAdresses() {
    const headers = await getHeaders(["addresses"]);

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

export async function updateCustomer(data: any) {
    const headers = await getHeaders(["customer"]);

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
    const headers = await getHeaders(["addresses"]);

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
    const headers = await getHeaders(["customer"]);

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
    const headers = await getHeaders(["addresses"]);

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
    const headers = await getHeaders(["addresses"]);

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
    const headers = await getHeaders(["orders"]);

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

export const getProduct = cache(async function (slug: string): Promise<any> {
    try {
        const headers = await getHeaders(["products"]);

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

export const getBrands = async (search: string = "", page: number = 1, limit: number = 100): Promise<any> => {
    const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/`, { search, page, limit });

    try {
        const response = await fetch(url, {
            next: {
                tags: ["brands"],
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch brands");
        }

        return await response.json();
    } catch (error) {
        return { message: error instanceof Error ? error.message : "Error fetching brands" };
    }
};

export const getActivites = cache(async function (limit: number = 10) {
    const headers = await getHeaders(["activities"]);

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
    const headers = await getHeaders(["activities"]);

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

export const getSiteConfigs = async (skip: number = 0, limit: number = 20): Promise<any> => {
    const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/`, { skip, limit });
    const headers = await getHeaders(["configs"]);

    try {
        const response = await fetch(url, {
            headers: {
                accept: "application/json",
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch configs");
        }

        return await response.json();
    } catch (error) {
        return { message: error instanceof Error ? error.message : "Error fetching configs" };
    }
};
