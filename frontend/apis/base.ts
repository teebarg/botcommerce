import { ApiResult, tryCatch } from "@/lib/try-catch";
import { deleteCookie } from "@/lib/util/cookie";
import { getCookie } from "@/lib/util/server-utils";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type RequestOptions = RequestInit & {
    params?: Record<string, string | number>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...restOptions } = options;

    // Add query parameters if they exist
    const url = new URL(`/api${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const token = await getCookie("access_token");
    const cartId = await getCookie("_cart_id");

    // Get auth token
    const headers = {
        "Content-Type": "application/json",
        ...(token && { "X-Auth": token }),
        cartId: cartId ?? "",
        ...options.headers,
    };

    const response = await fetch(url, {
        cache: options?.method == null || options?.method === "GET" ? "force-cache" : "no-store",
        ...restOptions,
        headers,
        credentials: "include",
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized access
            deleteCookie("access_token");
            window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }
        const error = await response.json();

        throw new Error(error.detail || error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions): ApiResult<T> => tryCatch<T>(request<T>(endpoint, { ...options, method: "GET" })),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions): ApiResult<T> =>
        tryCatch<T>(
            request<T>(endpoint, {
                ...options,
                method: "POST",
                body: JSON.stringify(data),
            })
        ),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        tryCatch<T>(
            request<T>(endpoint, {
                ...options,
                method: "PATCH",
                body: JSON.stringify(data),
            })
        ),

    put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        tryCatch<T>(
            request<T>(endpoint, {
                ...options,
                method: "PUT",
                body: JSON.stringify(data),
            })
        ),

    delete: <T>(endpoint: string, options?: RequestOptions) => tryCatch<T>(request<T>(endpoint, { ...options, method: "DELETE" })),
};

// import axios from "axios";

// const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export const api = axios.create({
//     baseURL,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// // Add request interceptor to add auth token
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// // Add response interceptor to handle errors
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Handle unauthorized access
//             localStorage.removeItem("token");
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     }
// );
