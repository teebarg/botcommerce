import { cache } from "react";

import { getCookie } from "../util/server-utils";

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

    const token = await getCookie("access_token");

    headers["X-Auth"] = token ?? "";

    return headers;
};

// Customer actions
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
