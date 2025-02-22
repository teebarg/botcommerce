"use server";

import { api } from "@/api";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function signUp(_currentState: unknown, formData: FormData) {
    const customer = {
        email: formData.get("email"),
        password: formData.get("password"),
        firstname: formData.get("first_name"),
        lastname: formData.get("last_name"),
        phone: formData.get("phone"),
    } as any;

    try {
        const token = await api.auth.signUp(customer);
        // await api.auth.login({ email: customer.email, password: customer.password })
        if (token) {
            const cookieStore = await cookies();

            cookieStore.set("access_token", token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });
        }
        revalidateTag("customer");
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}

export async function signIn(_prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const token = await api.auth.login({ email, password });
        if (token) {
            const cookieStore = await cookies();

            cookieStore.set("access_token", token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });
        }
        revalidateTag("customer");

        return { error: false, message: "Authentication successful" };
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}

export async function googleLogin(customer: { firstname: string; lastname: string; password: string; email: string }) {
    try {
        const token = await api.auth.social(customer);
        if (token) {
            const cookieStore = await cookies();

            cookieStore.set("access_token", token, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });
        }
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}
