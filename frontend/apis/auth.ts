import { fetcher } from "./fetcher";

import { revalidateUser } from "@/actions/revalidate";
import { Token } from "@/lib/models";

// Product API methods
export const authApi = {
    async login(input: { email: string; password: string }): Promise<string> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/login`;
        const { access_token } = await fetcher<Token>(url, { method: "POST", body: JSON.stringify(input) });

        revalidateUser();

        return access_token;
    },
    async logOut(): Promise<{ message: string }> {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/logout`;
        const response = await fetcher<{ message: string }>(url, { method: "POST" });

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
};
