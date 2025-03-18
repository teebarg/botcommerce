import { fetcher } from "./fetcher";

import { revalidate, signOut } from "@/actions/revalidate";
import { Message, Token } from "@/lib/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Product API methods
export const authApi = {
    async login(input: { email: string; password: string }): Promise<string> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/login`;
        const { access_token } = await fetcher<Token>(url, { method: "POST", body: JSON.stringify(input) });

        revalidate("user");

        return access_token;
    },
    async logOut(): Promise<{ message: string }> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/logout`;
        const response = await fetcher<{ message: string }>(url, { method: "POST" });

        await signOut();

        return response;
    },
    async signUp(input: { email: string; password: string; firstname: string; lastname: string }): Promise<string> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/logout`;
        const { access_token } = await fetcher<Token>(url, { method: "POST", body: JSON.stringify(input) });

        return access_token;
    },
    async social(input: { email: string; password: string; firstname: string; lastname: string }): Promise<string> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/social`;
        const { access_token } = await fetcher<Token>(url, { method: "POST", body: JSON.stringify(input) });

        return access_token;
    },
    async requestMagicLink(email: string): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/magic-link`;
        const response = await tryCatch<Message>(
            fetcher(url, { method: "POST", body: JSON.stringify({ email }), headers: { "Content-Type": "application/json" } })
        );

        return response;
    },
    async verifyMagicLink(token: string): ApiResult<Token> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-magic-link`;
        const response = await tryCatch<Token>(
            fetcher(url, { method: "POST", body: JSON.stringify({ token }) })
        );

        if (!response.error) {
            revalidate("customer");
        }

        return response;
    },
};
