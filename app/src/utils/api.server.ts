import { redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";

const baseURL = process.env.API_URL || "http://localhost.dev";

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const request = getRequest();
    const cookieHeader = request.headers.get("Cookie") || "";
    const { params, ...restOptions } = options;

    const url = new URL(`/api${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const headers = {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        ...options.headers,
    };

    const response = await fetch(url, {
        ...restOptions,
        headers,
    });

    if (response.status === 403) {
        throw redirect({
            to: "/forbidden",
        });
    }

    if (response.status === 401) {
        throw redirect({
            to: "/sign-in",
            search: {
                redirect: "/",
            },
        });
    }

    if (response.ok) {
        return response.json();
    }

    let message = "Request failed";

    try {
        const errorBody = await response.json();
        message = errorBody?.detail || errorBody?.message || errorBody?.error || message;
    } catch {
        message = response.statusText || message;
    }

    throw new Error(message);
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
