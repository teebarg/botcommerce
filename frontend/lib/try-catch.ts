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
    } catch (error) {
        // return handleError(error);
        return { data: null, error: (error as Error).message || "An error occurred" };
        // return { data: null, error: error as E };
    }
}
