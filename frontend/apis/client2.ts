import { getCookie } from "@/lib/util/server-utils";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type RequestOptions = RequestInit & {
    params?: Record<string, string | number>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}) {
    const { params, ...restOptions } = options;

    const url = new URL(`/api${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const token = await getCookie("access_token");
    const cartId = await getCookie("_cart_id");

    const headers = {
        "Content-Type": "application/json",
        "X-Auth": token ?? "token",
        cartId: cartId ?? "",
        ...options.headers,
    };

    return fetch(url, {
        ...restOptions,
        headers,
        credentials: "include",
    });
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "DELETE" }),
};
