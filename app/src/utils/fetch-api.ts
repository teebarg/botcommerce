import { getSessionFromContext } from "@/server/auth.server";
import { redirect } from "@tanstack/react-router";
import type { Session } from "start-authjs";
import { deleteCookie } from "@tanstack/react-start/server";

const baseURL = process.env.API_URL || "http://localhost.dev";

interface HeaderOptions {
    cartId?: string | undefined;
}

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    headers?: HeaderOptions;
    from?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const session = (await getSessionFromContext()) as unknown as Session;
    const { params, from, ...restOptions } = options;

    const url = new URL(`/api${endpoint}`, baseURL);

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

    if (response.status === 401 && from) {
        deleteCookie("__Secure-authjs.session-token", {
            path: "/",
            secure: true,
            sameSite: "none",
        });
        deleteCookie("authjs.session-token");

        throw redirect({
            to: "/auth/signin",
            search: {
                callbackUrl: from,
            },
        });
    }

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
