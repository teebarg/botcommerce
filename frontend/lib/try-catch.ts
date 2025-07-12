import { redirect } from "next/navigation";

import { deleteCookie } from "@/lib/util/cookie";

// Types for the result object with discriminated union
type Success<T> = {
    data: T;
    error: null;
};

type Failure<E> = {
    data: null;
    error: string;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export type ApiResult<T> = Promise<{ data: T | null; error: string | null }>;

// Main wrapper function
export async function tryCatch<T, E = string>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
        const data = await promise;

        return { data, error: null };
    } catch (err) {
        // return handleError(error);
        return { data: null, error: (err as Error).message || "An error occurred" };
        // return { data: null, error: error as E };
    }
}

export async function tryCatchApi<T>(promise: Promise<Response>, callbackUrl?: string): Promise<Result<T>> {
    try {
        const response = await promise;

        if (!response.ok) {
            if (response.status === 401) {
                deleteCookie("access_token");
                // Use redirect for server components instead of window.location
                // redirect(`/sign-in?callbackUrl=${encodeURIComponent(url.pathname)}`);
                redirect(`/sign-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
            }

            const error = await response.json();

            return {
                data: null,
                error: error.message || error.detail || response.statusText,
            };
        }

        const data = await response.json();

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: "An unknown error occurred",
        };
    }
}
