"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { api } from "@/apis";
import { Session } from "@/lib/models";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyToken(token: string) {
    try {
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
    
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        console.error("Token verification failed: ", error);
        return null;
    }
}

export async function setSession(token: string) {
    const cookieStore = await cookies();

    cookieStore.set("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        // sameSite: "strict",
    });
}

export async function getSession() {
    const cookieStore = await cookies();

    return cookieStore.get("access_token")?.value || null;
}

export async function clearSession() {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
}

export async function auth(): Promise<Session | null> {
    const token = await getSession();

    if (!token) return null;

    try {
        const user = (await verifyToken(token)) as any;
        if (!user) return null;

        return {
            id: user.id,
            email: user.sub ?? user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            image: user.image,
            isActive: user.is_active,
            isAdmin: user.is_superuser,
        };
    } catch (error) {
        return null; // Token is invalid or expired
    }
}

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
            await setSession(token);
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
            await setSession(token);
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
            await setSession(token);
        }
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}
