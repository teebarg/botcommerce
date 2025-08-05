import { api } from "@/apis/client";
import { Message, Token } from "@/schemas";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { deleteCookie, setCookie } from "@/lib/util/cookie";

export const authApi = {
    async logOut(): Promise<Message> {
        const response = await api.post<Message>("/auth/logout");

        if (!response.error) {
            await deleteCookie("access_token");
        }

        return response;
    },
    async signUp(input: { email: string; password: string; first_name: string; last_name: string }): ApiResult<Token> {
        return await tryCatch<Token>(api.post<Token>("/auth/signup", input));
    },
    async requestMagicLink(email: string, callbackUrl?: string): ApiResult<Message> {
        return await tryCatch<Message>(api.post<Message>("/auth/magic-link", { email, callback_url: callbackUrl }));
    },
    async verifyMagicLink(token: string): ApiResult<Token> {
        const response = await tryCatch<Token>(api.post<Token>("/auth/verify-magic-link", { token }));

        if (!response.error && response.data) {
            await setCookie("access_token", response.data.access_token);
        }

        return response;
    },
    async oauthCallback(provider: "google" | "github", code: string): ApiResult<Token> {
        const response = await tryCatch<Token>(api.post<Token>(`/auth/oauth/${provider}/callback`, { code }));

        if (response.data) {
            await setCookie("access_token", response.data.access_token);
        }

        return response;
    },
};
