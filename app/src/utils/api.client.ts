const baseURL = import.meta.env.VITE_API_URL ?? "https://api.yourdomain.com";

type ClientRequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined | object | unknown>;
};

async function clientRequest<T>(endpoint: string, options: ClientRequestOptions = {}): Promise<T> {
    const { params, ...rest } = options;

    const url = new URL(`/api${endpoint}`, baseURL);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null) continue;
            url.searchParams.append(key, String(value));
        }
    }

    const response = await fetch(url.toString(), {
        ...rest,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...rest.headers,
        },
    });

    if (response.status === 401) {
        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        let message = "Request failed";
        try {
            const body = await response.json();
            message = body?.detail || body?.message || message;
        } catch { }
        throw new Error(message);
    }

    return response.json();
}

export const clientApi = {
    get: <T>(endpoint: string, options?: ClientRequestOptions) => clientRequest<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, data?: unknown, options?: ClientRequestOptions) =>
        clientRequest<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data?: unknown, options?: ClientRequestOptions) =>
        clientRequest<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data?: unknown, options?: ClientRequestOptions) =>
        clientRequest<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string, options?: ClientRequestOptions) => clientRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
