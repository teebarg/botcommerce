import { getSessionFromContext } from "@/server/auth.server";
import type { Session } from "start-authjs";

const isServer = typeof window === "undefined";

const API_BASE_URL = isServer
  ? process.env.API_URL!
  : import.meta.env.VITE_API_URL!;

interface HeaderOptions {
    cartId?: string | undefined;
}

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    headers?: HeaderOptions;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const session = await getSessionFromContext() as unknown as Session;
    const { params, ...restOptions } = options;

    const url = new URL(`/api${endpoint}`, API_BASE_URL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const headers = {
        "Content-Type": "application/json",
        "X-Auth": session?.accessToken ?? "jwt",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...restOptions,
        headers,
        credentials: "include",
    });

    return response.json();
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
