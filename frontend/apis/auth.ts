import { api } from "./base";

import { revalidate } from "@/actions/revalidate";
import { Message, Token } from "@/types/models";
import { ApiResult } from "@/lib/try-catch";
import { deleteCookie, setCookie } from "@/lib/util/cookie";

// Product API methods
export const authApi = {
    async logOut(): ApiResult<Message> {
        const response = await api.post<Message>("/auth/logout");

        if (!response.error) {
            await deleteCookie("access_token");
        }

        return response;
    },
    async signUp(input: { email: string; password: string; first_name: string; last_name: string }): ApiResult<Token> {
        const response = await api.post<Token>("/auth/signup", input);

        revalidate("user");

        return response;
    },
    async social(input: { email: string; first_name: string; last_name: string; image: string }): ApiResult<Token> {
        const response = await api.post<Token>("/auth/google", input);

        if (!response.error && response.data) {
            await setCookie("access_token", response.data.access_token);
            revalidate("user");
        }

        return response;
    },
    async requestMagicLink(email: string, callbackUrl?: string): ApiResult<Message> {
        const response = await api.post<Message>("/auth/magic-link", { email, callback_url: callbackUrl });

        return response;
    },
    async verifyMagicLink(token: string): ApiResult<Token> {
        const response = await api.post<Token>("/auth/verify-magic-link", { token });

        if (!response.error && response.data) {
            await setCookie("access_token", response.data.access_token);
            revalidate("user");
        }

        return response;
    },
};
