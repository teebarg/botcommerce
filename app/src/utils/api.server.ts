import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { deleteCookie, getCookies } from "@tanstack/react-start/server";

const baseURL = process.env.API_URL || "http://localhost.dev";

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const cookies = getCookies();
    const { params, ...restOptions } = options;
    const { getToken } = await auth();
    const token = await getToken({ template: "default" });
    console.log("🚀 ~ file: api.server.ts:16 ~ token:", token)

    const url = new URL(`/api${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const cookieHeader = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");

    const headers = {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        ...options.headers,
        "X-Auth": token || "",
    };

    const response = await fetch(url, {
        ...restOptions,
        headers,
    });

    // if (response.status === 403) {
    //     throw redirect({
    //         to: "/forbidden",
    //     });
    // }

    if (response.status === 401) {
        throw redirect({
            to: "/sign-in",
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
