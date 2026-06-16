import { redirect } from "@tanstack/react-router";

const isServer = typeof window === "undefined";

const baseURL = isServer
    ? (process.env.API_URL || "http://shop-api:8000")
    : (import.meta.env.VITE_API_URL || "https://api.shop.localhost");

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined | object | unknown>;
};

async function executeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...restOptions } = options;
    const url = new URL(`/api${endpoint}`, baseURL);

    // Safe Param Parsing (Preserves 0 and false parameters)
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value === null || value === undefined) continue;
            url.searchParams.append(key, String(value));
        }
    }

    const headersInstance = new Headers(restOptions.headers);

    if (!headersInstance.has("Content-Type")) {
        headersInstance.set("Content-Type", "application/json");
    }

    let currentPath = "/";

    // Server-side Header and Path Injection
    if (isServer) {
        const { getRequest } = await import("@tanstack/react-start/server");
        const serverReq = getRequest();

        if (serverReq) {
            const incomingUrl = new URL(serverReq.url);
            currentPath = `${incomingUrl.pathname}${incomingUrl.search}`;

            const cookie = serverReq.headers.get("Cookie");
            if (cookie) headersInstance.set("Cookie", cookie);

            const host = serverReq.headers.get("host");
            if (host) headersInstance.set("Host", host);
          }
    } else {
        // Client-side execution context parameters
        restOptions.credentials = "include";
        currentPath = window.location.pathname + window.location.search;
    }

    const response = await fetch(url.toString(), {
        ...restOptions,
        headers: headersInstance,
    });

    // 3. Robust Authentication Redirects
    if (response.status === 403) {
        throw redirect({ to: "/forbidden" });
    }

    if (response.status === 404) {
        throw redirect({ to: "/not-found" });
    }

    if (response.status === 401) {
        throw redirect({
            to: "/sign-in",
            search: {
                redirect: currentPath,
            },
        });
    }

    if (!response.ok) {
        let message = "Request failed";
        try {
            const errorBody = await response.json();
            message = errorBody?.detail || errorBody?.message || errorBody?.error || message;
        } catch {
            message = response.statusText || message;
        }
        throw new Error(message);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        executeRequest<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        executeRequest<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(data) }),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        executeRequest<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) }),

    put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        executeRequest<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        executeRequest<T>(endpoint, { ...options, method: "DELETE" }),
};