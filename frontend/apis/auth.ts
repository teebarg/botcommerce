import { fetcher } from "./fetcher";

import { revalidate } from "@/actions/revalidate";
import { Message, Token } from "@/types/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { deleteCookie } from "@/lib/util/cookie";

// Product API methods
export const authApi = {
    async login(input: { email: string; password: string }): Promise<string> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/login`;
        const { access_token } = await fetcher<Token>(url, { method: "POST", body: JSON.stringify(input) });

        revalidate("user");

        return access_token;
    },
    async logOut(): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/logout`;
        const response = await tryCatch<Message>(fetcher(url, { method: "POST" }));

        if (!response.error) {
            await deleteCookie("access_token");
        }
        return response;
    },
    async signUp(input: { email: string; password: string; first_name: string; last_name: string }): ApiResult<{ access_token: string }> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`;
        const res = await tryCatch<{ access_token: string }>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        revalidate("user");

        return res;
    },
    async social(input: { email: string; password: string; first_name: string; last_name: string }): ApiResult<Token> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/social`;
        const data = await tryCatch<Token>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        return data;
    },
    async requestMagicLink(email: string, callbackUrl?: string): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/magic-link`;
        const response = await tryCatch<Message>(
            fetcher(url, {
                method: "POST",
                body: JSON.stringify({ email, callback_url: callbackUrl }),
            })
        );

        return response;
    },
    async verifyMagicLink(token: string): ApiResult<Token> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-magic-link`;
        const response = await tryCatch<Token>(fetcher(url, { method: "POST", body: JSON.stringify({ token }) }));

        if (!response.error) {
            revalidate("customer");
        }

        return response;
    },
};
