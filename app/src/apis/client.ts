const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | unknown>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = "ksksksk"
    const { params, ...restOptions } = options;

    const url = new URL(`/api${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    // const cartId = await getCookie("_cart_id");

    const headers = {
        "Content-Type": "application/json",
        "X-Auth": token ?? "token",
        cartId: "",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...restOptions,
        headers,
        credentials: "include",
    });

    if (!response.ok) {
        if (response.status === 401) {
            // await signOut({ redirect: false });
            // window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }
        const error = await response.json();

        throw new Error(error.detail || error.message || `API Error: ${response.statusText}`);
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
