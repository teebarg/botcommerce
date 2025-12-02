import { api } from "@/apis/client";
import { Message, Token } from "@/schemas";
import { ApiResult, tryCatch } from "@/lib/try-catch";

export const authApi = {
    async logOut(): Promise<Message> {
        return await api.post<Message>("/auth/logout");
    },
    async signUp(input: { email: string; password: string; first_name: string; last_name: string }): ApiResult<Token> {
        return await tryCatch<Token>(api.post<Token>("/auth/signup", input));
    },
};
