interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
        // First, get the token from our auth endpoint
        const tokenResponse = await fetch("/api/auth/token");
        const { token } = await tokenResponse.json();

        // Merge the provided options with our auth headers
        const finalOptions: RequestInit = {
            ...options,
            headers: {
                ...options.headers,
                "X-Auth": token,
                "Content-Type": "application/json",
            },
        };

        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();

        return { data };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
